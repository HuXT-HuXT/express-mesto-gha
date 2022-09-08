const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use((req, res, next) => {
  req.user = {
    _id: '6314b11634f09f4290e5ca63'
  };

  next();
})
app.use('/users', routerUsers);
app.use('/cards', routerCards);

app.listen(7665, () => {
  console.log('Server up');
})