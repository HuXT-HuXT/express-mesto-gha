const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { OK } = require('../constants/constants');
const Conflict = require('../errors/Conflict');
const DefaultError = require('../errors/DefaultError');
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
            next(new Conflict('Email уже существует'));
          } else if (err.name === 'ValidationError') {
            next(new InputError({ message: 'Переданы некорректные данные при создании пользователя.'}));
          } else {
            next(new DefaultError({ message: 'Ошибка по умолчанию' }));
          }
        });
    });
};
// Read all users
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(OK).send(users);
    })
    .catch(() => {
      next(new DefaultError({ message: 'Ошибка по умолчанию' }));
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
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
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор пользователя.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
      }
    });
};

// Read user by ID
const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
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
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор пользователя.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
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
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new InputError('Невалидный идентификатор пользователя.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
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
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new InputError('Невалидный идентификатор пользователя.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new NotFound('Неправильные почта или пароль'));
      }

      return { matched: bcrypt.compare(password, user.password), _id: user._id };
    })
    .then((data) => {
      if (!data.matched) {
        return Promise.reject(new NotFound('Неправильные почта или пароль'));
      }
      const token = jwt.sign({ _id: data._id }, 'very-secret-key');
      console.log(token);
      return res
        .status(OK)
        .cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
        })
        .send({ id: data._id });
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        next(err);
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
      }
    });
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
