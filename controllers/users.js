const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { OK } = require('../constants/constants');
const Conflict = require('../errors/Conflict');
const DefaultError = require('../errors/DefaultError');
const Unauthorized = require('../errors/Unauthorized');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');

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
          res.status(OK).send({
            name, about, avatar, _id,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            throw new Conflict('Email уже существует');
          }
        })
        .catch(next);
    });
};
// Read all users
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(OK).send(users);
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
      }
      res.status(OK).send({
        data: user,
      });
    })
    .catch(next);
};
// Read user by ID
const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {

      throw new Error('NotFound');
    })
    .then((user) => {
      const {
        name, about, avatar, _id,
      } = user;
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFound(`Пользователь с указанным ${req.params.id} не найден.`);
      }
    })
    .catch(next);
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
      throw new Error('NotFound');
    })
    .then((user) => {
      const {
        avatar, _id,
      } = user;
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
      }
    })
    .catch(next);
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
      throw new Error('NotFound');
    })
    .then((user) => {
      const {
        name, about, _id,
      } = user;
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Unauthorized'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Unauthorized'));
          }
          const token = jwt.sign({ _id: user._id }, 'very-secret-key');

          return res
            .status(OK)
            .cookie('jwt', token, {
              maxAge: 604800000,
              httpOnly: true,
            })
            .send({ id: user._id });
        });
    })
    .catch((err) => {
      if (err.message === 'Unauthorized') {
        throw new Unauthorized('Неправильные почта или пароль');
      }
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
