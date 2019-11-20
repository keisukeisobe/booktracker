const xss = require('xss');

const BooksService = {
  serializeBook(book){
    return {
      id: book.id,
      title: xss(book.title),
      description: xss(book.description),
      author_id: book.author_id,
      date_published: xss(book.date_published)     
    };
  },
  getAllBooks(db) {
    return db.from('books as book')
      .select('*');
  },
  getBookById(db, id) {
    return db.from('books as book')
      .select('*')
      .where('book.id', id)
      .first();
  },
  insertBook(db, newBook) {
    return db.insert(newBook).into('books').returning('*').then(([book]) => book)
      .then(book => BooksService.getBookById(db, book.id));
  },
  getProgressById(db, id) {
    return db.from('progress')
      .select('*')
      .where('progress.id', id)
      .first();
  }
};

module.exports = BooksService;