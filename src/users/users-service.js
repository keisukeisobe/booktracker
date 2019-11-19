
const UsersService = {
  getAllUsers(db) {
    return db.from('users')
      .select('*');
  },
  getUserProfile(db, user_id) {
    return db.from('progress')
      .select('books.title', 'authors.name', 'progress.reading_status', 'progress.percent', 'ratings.rating', 'progress.id', 'books.id AS book_id')
      .join('books', 'progress.book_id', '=', 'books.id')
      .join('authors', 'authors.id', '=', 'books.author_id')
      .join('ratings', 'ratings.book_id', '=', 'books.id')
      .where('progress.user_id', user_id);
  },
  getUserProfileBook(db, user_id, book_id) {
    return db.from('progress')
      .select('books.title', 'books.description', 'authors.name', 'progress.reading_status', 'progress.percent', 'ratings.rating', 'progress.id', 'books.id AS book_id')
      .join('books', 'progress.book_id', '=', 'books.id')
      .join('authors', 'authors.id', '=', 'books.author_id')
      .join('ratings', 'ratings.book_id', '=', 'books.id')
      .where('progress.user_id', user_id)
      .andWhere('progress.book_id', book_id);
  }
};

module.exports = UsersService;