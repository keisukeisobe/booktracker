const express = require('express');
const UsersService = require('./users-service.js');
const usersRouter = express.Router();

const serializeUser = user => ({
  id: user.id,
  username: user.username
});

usersRouter.route('/users/')
  //.all(requireAuth)
  //.all(checkThingExists)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  });

module.exports = usersRouter;
