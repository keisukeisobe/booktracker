const express = require('express');
const path = require('path');
const BooksService = require('./books-service.js');
const {requireAuth} = require('../middleware/jwt-auth');
const booksRouter = express.Router();
const jsonBodyParser = express.json();

booksRouter.route('/books/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BooksService.getAllBooks(knexInstance)
      .then(books => {
        if(!books) {
          return res.status(404).json({error: 'No books exist'});
        }
        res.json(books.map(BooksService.serializeBook));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const {title, author, genre } = req.body;
    const newBook = {title, author, genre};
    const requiredFields = ['title', 'author', 'genre'];
    const knexInstance = req.app.get('db');
    for (const key of requiredFields) {
      if(!(key in req.body)){
        return res.status(400).json({error: `Missing '${key}' in request body`});
      }
    }

    newBook.user_id = req.user.user_id;

    BooksService.insertBook(knexInstance, newBook)
      .then(book => {
        res.status(201).location(path.posix.join(req.originalUrl, `/${book.book_id}`))
          .json(BooksService.serializeBook(book));
      })
      .catch(next);
    
  });

booksRouter.route('/books/:book_id')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BooksService.getBookById(knexInstance, req.params.book_id)
      .then(book => {
        if (!book) {
          return res.status(404).json({
            error: 'Book does not exist'
          });
        }
        return res.json(book);
      })
      .catch(next);
  });

module.exports = booksRouter;
