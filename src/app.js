require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const usersRouter = require('./users/users-router');
const booksRouter = require('./books/books-router');
const authRouter = require('./auth/auth-router');
const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api', usersRouter);
app.use('/api', booksRouter);
app.use('/api', authRouter);

// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = {error: {message: 'server error'} };
  } else {
    // eslint-disable-next-line no-console
    //console.error(error);
    response= {message:error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;