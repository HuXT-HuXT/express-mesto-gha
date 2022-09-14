const Card = require('../models/card');
const {
  OK, INPUT_DATA_ERROR, DATABASE_ERROR, handleError,
} = require('../constants/constants');

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INPUT_DATA_ERROR).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        handleError(req, res);
      }
    });
};

const readCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(OK).send({ data: cards });
    })
    .catch(() => handleError(req, res));
};

const removeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(() => {
      const error = new Error(`Карточка с указанным ${cardId} не найдена.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => Card.deleteOne(card)
      .then(() => res.send({ data: card })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор карточки' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
};

const likeCard = ((req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error(`Карточка с указанным ${cardId} не найдена.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор карточки' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
});

const dislikeCard = ((req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error(`Карточка с указанным ${cardId} не найдена.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INPUT_DATA_ERROR).send({ message: 'Невалидный идентификатор карточки' });
      } else if (err.statusCode === 404) {
        res.status(DATABASE_ERROR).send({ message: err.message });
      } else {
        handleError(req, res);
      }
    });
});

module.exports = {
  createCard,
  readCards,
  removeCard,
  likeCard,
  dislikeCard,
};
