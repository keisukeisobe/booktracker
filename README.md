BookTracker

Link: https://booktracker-app.now.sh

BookTracker is an app that will allow you to track what books you're reading, your progress in you
books, and rate the books you've read in a more granular fashion than other reading apps. 

BookTracker also provides users with a profile of their reading habits and proclivities, based on their 
ratings of books in their library. 

This project uses React, Express, and PostgreSQL.

Screenshots: 

https://i.imgur.com/GgGfWWd.png

https://i.imgur.com/E540aoC.png

https://i.imgur.com/eETCCUj.png

API Documentation: 

Endpoints: /users/:userId, /users/:userId/books/:bookId

Base URL: https://intense-cliffs-98344.herokuapp.com/api/

POST /users

Creates a new user. Requires a request body with an username, email, and password. 

GET /users/[USER ID]

Provides an array of all books read by the specified user ID.

POST /users/[USER ID]

Creates new book entry that is keyed to the specified user. Requires a request body 
with a title, author, description, and page count. 

GET /users/[USER ID]/books/[BOOK ID]

Provides a book object from within that user's library. 

PATCH /users/[USER ID]/books/[BOOK ID]

Updates a book object from the user's library with the supplied information. 

