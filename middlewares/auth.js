const jwt = require('jsonwebtoken');

const Unauthorized = require('../errors/Unauthorized');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new Unauthorized('Необходима авторизацция'));
  }

  let payload;

  try {
    payload = jwt.verify(token, 'very-secret-key');
  } catch (err) {
    next(new Unauthorized('Необходима авторизацция'));
  }

  req.user = payload;

  next();
};
