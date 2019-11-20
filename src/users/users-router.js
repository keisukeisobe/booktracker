const BooksService =require( '../books/books-service');
const express = require('express');
const path = require('path');
const UsersService = require('./users-service.js');
const jsonParser = express.json();
const {requireAuth} = require('../middleware/jwt-auth');

const usersRouter = express.Router();

const serializeUser = user => ({
  id: user.id,
  username: user.username
});

const serializeUserProfile = progress => ({
  title: progress.title,
  author_name: progress.name,
  status: progress.reading_status,
  percent: progress.percent,
  rating: progress.rating,
  progress_id: progress.id,
  book_id: progress.book_id
});

const serializeUserProfileBook = progress => ({
  title: progress.title,
  author_name: progress.name,
  description: progress.description,
  status: progress.reading_status,
  percent: progress.percent,
  rating: progress.rating,
  progress_id: progress.id,
  book_id: progress.book_id
});

usersRouter.route('/users/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        if(!users) {
          return res.status(404).json({error: 'No users exist'});
        }
        res.json(users.map(serializeUser));
      })
      .catch(next);
  });

usersRouter.route('/users/:user_id')
  .all(requireAuth)
  // eslint-disable-next-line no-unused-vars
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getUserProfile(knexInstance, req.params.user_id)
      .then(profile => {
        if(!profile) {
          return res.status(404).json({error: 'User does not exist'});
        }
        res.json(profile.map(serializeUserProfile));
      });
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { title, author, genre } = req.body;
    const newBook =  { title, author, genre };
    const requiredFields = ['title', 'author', 'genre'];
    for (const key of requiredFields) {
      if(!(key in req.body)){
        return res.status(400).json({error: `Missing ${key} in request body`});
      }
    }
    newBook.user_id = req.user.id;

    let newBookId = '';

    UsersService.insertBook(
      req.app.get('db'),
      newBook
    )
      .then(book => {
        newBookId = book.id;
        res.status(201).location(path.posix.join(req.originalUrl, `/books/${book.id}`))
          .json(BooksService.serializeBook(book));
      })
      .catch(next);

    const newProgress = {
      book_id: newBookId,
      user_id: req.user.id,
      percent: 0,
      reading_status: 'in progress'
    };
    UsersService.insertProgress(
      req.app.get('db'),
      newProgress
    )
      .then(progress => {
        res.status(201).json(progress);
      });
  });


usersRouter.route('/users/:user_id/books/:book_id')
  .all(requireAuth)
  // eslint-disable-next-line no-unused-vars
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getUserProfileBook(knexInstance, req.params.user_id, req.params.book_id)
      .then(book => {
        if(!book) {
          return res.status(404).json({error: 'User has not logged this book'});
        }
        res.json(book.map(serializeUserProfileBook));
      });
  });

module.exports = usersRouter;
