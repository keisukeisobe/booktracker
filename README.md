# BookTracker

## Link: https://booktracker-app.now.sh

## Welcome to BookTracker
BookTracker is an app that will allow you to track what books you're reading, your progress in you
books, and rate the books you've read in a more granular fashion than other reading apps. 

BookTracker also provides users with a profile of their reading habits and proclivities, based on their 
ratings of books in their library. 

## API Documentation: 
```
├── /auth/login
│   └── POST    /           (log in)
|
├── /users
│   └── GET     /lists      (get lists for user)
|
├── /users/:user_id
│   └── GET     /           (gets user information)
│   └── POST    /           (post new book to user's list)
|
├── /users/:user_id/books/:book_id
│   └── GET     /           (get book from user list)
│   └── PATCH   /           (update book information for user)
```

Base URL: https://intense-cliffs-98344.herokuapp.com/api/

## Tech Specs: 
**Front-end:**
- React
- HTML5
- CSS
- Zeit

**Back-end**
- Node
- Express
- PostgreSQL DB hosted on Heroku
- JWT 
