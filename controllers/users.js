const User = require('../models/user')
const { OK, INPUT_DATA_ERROR, DATABASE_ERROR, DEFAULT_ERROR, handleError } = require('../constants/constants');

//Create user
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      const { name, about, avatar, _id } = user;
      res.status(OK).send(JSON.stringify(name, about, avatar, _id))
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(INPUT_DATA_ERROR).send({ message: "Переданы некорректные данные при создании пользователя." })
      } else {
      handleError(req, res)
    }
  })
}
//Read all users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      if (users.length !== 0) {
      res.status(OK).send(users)
    } else {
      res.status(DATABASE_ERROR).send({message: `Пользователи не найдены.`})
    }
    })
    .catch(err => handleError(req, res))
}
//Read current user
const getUser = (req, res) => {
  console.log(user)
  User.findById(req.params.id)
  .then((user) => {
    if (user) {
      const { name, about, avatar, _id } = user
      res.status(OK).send({ name, about, avatar, _id })
    } else {
      res.status(DATABASE_ERROR).send({message: `Пользователь по указанному ${req.params.id} не найден.`})
    }
  })
  .catch(err => handleError(req, res))
}
//Update name/ about
const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true
    }
    )
    .then((user) => {
      if (user) {
        const { name, about, avatar, _id } = user
        res.status(OK).send({ name, about, avatar, _id })
      } else {
        res.status(DATABASE_ERROR).send({message: `Пользователь по указанному ${req.params.id} не найден.`})
      }
    })
    .catch(err => {
      if (err.name === "ValidationError") {
        res.status(INPUT_DATA_ERROR).send({message: "Переданы некорректные данные при создании пользователя. "})
      } else {
      handleError(req, res)
    }
  })
}
//Update avatar
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: true
    })
    .then((user) => {
      if (user) {
        const { name, about, avatar, _id } = user
        res.status(OK).send({ name, about, avatar, _id })
      } else {
        res.status(DATABASE_ERROR).send({message: `Пользователь по указанному ${req.params.id} не найден.`})
      }
    })
    .catch(err => {
      if (err.name === "ValidationError") {
        res.status(INPUT_DATA_ERROR).send({message: "Переданы некорректные данные при создании пользователя. "})
      } else {
      handleError(req, res)
    }
  })
}

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateAvatar
}