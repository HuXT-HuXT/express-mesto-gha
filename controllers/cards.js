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
        res.status(404).send({ message: "Карточки не найдены." })
      }
    })
    .catch(err => handleError(req, res))
}

const removeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
  .orFail(() => {
    const error = new Error('Нет карточки по заданному id');
    error.statusCode = 404;
    throw error;
  })
  .then((card) => Card.deleteOne(card)
    .then(() => res.send({ data: card })))
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Невалидный идентификатор карточки' });
    } else if (err.statusCode === 404) {
      res.status(404).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Произошла ошибка' });
    }
  });
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