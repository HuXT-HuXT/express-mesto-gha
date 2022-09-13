const User = require('../models/user');
const {
  OK, INPUT_DATA_ERROR, DATABASE_ERROR, handleError,
} = require('../constants/constants');

// Create user
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      const {
        name, about, avatar, _id,
      } = user;
      res.status(OK).send({
        name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INPUT_DATA_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        handleError(req, res);
      }
    });
};
// Read all users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(OK).send(users);
    })
    .catch((err) => handleError(req, res));
};
// Read current user
const getUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error(`Пользователь с указанным ${req.params.id} не найден.`);
      error.statusCode = 404;
      throw error;
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
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор пользователя.' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
};
// Update name/ about
const updateUser = (req, res) => {
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
      const error = new Error(`Пользователь с указанным ${req.user._id} не найден.`);
      error.statusCode = 404;
      throw error;
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
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор пользователя.' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
};
// Update avatar
const updateAvatar = (req, res) => {
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
      const error = new Error(`Пользователь с указанным ${req.user._id} не найден.`);
      error.statusCode = 404;
      throw error;
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
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор пользователя.' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  updateAvatar,
};
