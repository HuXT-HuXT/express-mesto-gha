const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Non-authorized' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'very-secret-key');
  } catch (err) {
    return res.status(401).send({ message: 'Non-authorized' });
  }

  req.user = payload;

  next();
};
