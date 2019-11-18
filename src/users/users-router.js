const express = require('express');
const UsersService = require('./users-service.js');
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
  progress_id: progress.id
});

usersRouter.route('/users/')
  //.all(requireAuth)
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
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getUserProfile(knexInstance, req.params.user_id)
      .then(profile => {
        if(!profile) {
          return res.status(404).json({error: 'User does not exist'});
        }
        res.json(profile.map(serializeUserProfile));
      });
  });

usersRouter.route('/users/:user_id/book/:book_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getUserProfileBook(knexInstance, req.params.user_id, req.params.book_id)
      .then(book => {
        if(!book) {
          return res.status(404).json({error: 'User has not logged this book'});
        }
        res.json(book);
      });
  });


module.exports = usersRouter;
