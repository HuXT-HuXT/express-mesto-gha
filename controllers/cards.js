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
  Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (card) {
      res.status(OK).send(card)
    } else {
      res.status(DATABASE_ERROR).send({c})
    }
  })
    .catch(err => handleError(req, res))

}

const likeCard = ((req, res) => {
  const { cardId } = req.params;
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
})

const dislikeCard = ((req, res) => {
  const { cardId } = req.params;
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
})

module.exports = {
  createCard,
  readCards,
  removeCard,
  likeCard,
  dislikeCard,
}