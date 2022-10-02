const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Conflict = require('../errors/Conflict');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

// Create user
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashPassword) => {
      User.create({
        name, about, avatar, email, password: hashPassword,
      })
        .then((user) => {
          const { _id } = user;
          res.send({
            name, about, avatar, _id,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new Conflict('Email уже существует'));
          } else if (err.name === 'ValidationError') {
            next(new InputError('Переданы некорректные данные при создании пользователя.'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};
// Read all users
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
      }
      res.send({
        data: user,
      });
    })
    .catch(next);
};
// Read user by ID
const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.params.id} не найден.`);
    })
    .then((user) => {
      const {
        name, about, avatar, _id,
      } = user;
      res.send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор пользователя.'));
      } else {
        next(err);
      }
    });
};
// Update name/ about
const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
    })
    .then((user) => {
      const {
        avatar, _id,
      } = user;
      res.send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};
// Update avatar
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
    })
    .then((user) => {
      const {
        name, about, _id,
      } = user;
      res.send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, 'very-secret-key');

          return res
            .cookie('jwt', token, {
              maxAge: 604800000,
              httpOnly: true,
            })
            .send({ id: user._id });
        });
    })
    .catch(next);
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  updateAvatar,
  login,
  getCurrentUser,
};
