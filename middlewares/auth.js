const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(token);

  if (!token) {
    return res.status(401).send({ message: 'Non-authorized' });
  }

  let payload;

  try {
    payload = jwt.verify(token, 'very-secret-key');
  } catch (err) {
    return res.status(401).send({ message: 'Non-authorized' });
  }

  req.user = payload;

  next();
};
