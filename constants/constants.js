const OK = 200;
const INPUT_DATA_ERROR = 400;
const DATABASE_ERROR = 404;
const DEFAULT_ERROR = 500;

const handleError = (req, res) => {
  res.status(DEFAULT_ERROR).send({ message: "Ошибка по умолчанию."})
}

module.exports = {
  OK,
  INPUT_DATA_ERROR,
  DATABASE_ERROR,
  handleError
}