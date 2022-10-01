const Card = require('../models/card');
const Forbidden = require('../errors/Forbidden');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      //решил, что проверка валидиации будет лишней, так как за это теперь отввечает celebrate)
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(err);
      }
    });
};

const readCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(next);
};

const removeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .orFail(() => {
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => {
      const owner = card.owner.toString();

      if (owner !== userId) {
        throw new Forbidden('Карточка создана другим пользователем.');
      }
      Card.deleteOne(card)
        .then(() => res.send({ data: card }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        //нужна ли тогда и такая проверка?
        next(new InputError('Невалидный идентификатор карточки.'));
      } else {
        next(err);
      }
    });
};

const likeCard = ((req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      } else {
        next(err);
      }
    });
});

const dislikeCard = ((req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      } else {
        next(err);
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
