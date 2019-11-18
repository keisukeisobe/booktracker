//const xss = require('xss');
//const Treeize = require('treeize');

const UsersService = {
  getAllUsers(db) {
    return db.from('users')
      .select('*');
  }
};

module.exports = UsersService;