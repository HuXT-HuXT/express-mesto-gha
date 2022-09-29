const Card = require('../models/card');
const { OK } = require('../constants/constants');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch(next);
};

const readCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(OK).send({ data: cards });
    })
    .catch(next);
};

const removeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => {
      const owner = card.owner.toString();

      if (owner !== userId) {
        console.log(owner !== userId)
        throw new Error('Forbidden');
      }
      Card.deleteOne(card)
        .then(() => res.send({ data: card }));
    })
    .catch((err) => {
      if (err.message === 'Forbidden') {
        throw new Forbidden('Карточка создана другим пользователем.');
      }
      if (err.message === 'NotFound') {
        throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
      }
    })
    .catch(next);
};

const likeCard = ((req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
      }
    })
    .catch(next);
});

const dislikeCard = ((req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => {
    throw new Error('NotFound');
  })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
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
