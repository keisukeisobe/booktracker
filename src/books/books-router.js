const express = require('express');
const BooksService = require('./books-service.js');
const booksRouter = express.Router();
//const { requireAuth } = require('../middleware/jwt-auth');

booksRouter.route('/books/')
  //.all(requireAuth)
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
  });

booksRouter.route('/books/:book_id')
  //.all(requireAuth)
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
