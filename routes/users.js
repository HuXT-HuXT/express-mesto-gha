const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getCurrentUser, getUsers, getUserById, updateUser, updateAvatar,
} = require('../controllers/users');
const { regex } = require('../constants/constants');

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), getUserById);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }),
}), updateAvatar);

module.exports = router;
