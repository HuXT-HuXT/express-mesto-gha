const mongoose = require('mongoose');
const Card = require('../models/card');
const { OK, INPUT_DATA_ERROR, DATABASE_ERROR, handleError } = require('../constants/constants')

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK).send(card)
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(INPUT_DATA_ERROR).send({ message: "Переданы некорректные данные при создании карточки." })
      } else {
        handleError(req, res);
      }

    })
}

const readCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length !== 0) {
        res.status(OK).send(cards)
      } else {
        res.status(DATABASE_ERROR).send({ message: "Карточки не найдены." })
      }
    })
    .catch(err => handleError(req, res))
}

const removeCard = (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        console.log(card)
        if (card) {
          res.status(OK).send({ message: `Карточка ${req.params.cardId} была удалена.` })
        } else {
          res.status(DATABASE_ERROR).send({ message: "Карточка не найдена." })
        }
      })
      .catch(err => handleError(req, res))
    } else {
      res.status(INPUT_DATA_ERROR).send({ message: `Некорректно задан id ${req.params.cardId}.` })
    }
}

const likeCard = ((req, res) => {
  const { cardId } = req.params;
  if (mongoose.Types.ObjectId.isValid(cardId)) {
    Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true })
      .then((card) => {
        if (card) {
          res.status(OK).send(card)
        } else {
          res.status(DATABASE_ERROR).send({ message: `Карточка с указанным ${cardId} не найдена.` })
        }
      })
      .catch(err => handleError(req, res))
    } else {
      res.status(INPUT_DATA_ERROR).send({ message: `Некорректно задан id ${cardId}.` })
    }
})

const dislikeCard = ((req, res) => {
  const { cardId } = req.params;
  if (mongoose.Types.ObjectId.isValid(cardId)) {
    Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true })
      .then((card) => {
        if (card) {
          res.status(OK).send(card)
        } else {
          res.status(DATABASE_ERROR).send({ message: `Карточка с указанным ${cardId} не найдена.` })
        }
      })
      .catch(err => handleError(req, res))
    } else {
      res.status(INPUT_DATA_ERROR).send({ message: `Некорректно задан id ${cardId}.` })
    }
})

module.exports = {
  createCard,
  readCards,
  removeCard,
  likeCard,
  dislikeCard,
}