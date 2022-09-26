const Card = require('../models/card');
const { OK } = require('../constants/constants');
const Conflict = require('../errors/Conflict');
const DefaultError = require('../errors/DefaultError');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(new DefaultError('Ошибка по умолчанию'));
      }
    });
};

const readCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(OK).send({ data: cards });
    })
    .catch(() => {
      next(new DefaultError('Ошибка по умолчанию'));
    });
};

const removeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  console.log(req.user._id);
  Card.findById(cardId)
    .orFail(() => {
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => {
      const owner = card.owner.toString();
      if (owner !== userId) {
        throw new Unauthorized('Карточка создана другим пользователем.');
      }
      Card.deleteOne(card)
        .then(() => res.send({ data: card }))
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      }
      if (err.statusCode === 401) {
        next(err);
      }
      if (err.statusCode === 404) {
        next(err);
      } else {
        ext(new DefaultError('Ошибка по умолчанию'));
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
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        ext(new DefaultError('Ошибка по умолчанию'));
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
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        ext(new DefaultError('Ошибка по умолчанию'));
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
