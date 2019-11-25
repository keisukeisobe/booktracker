const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');


describe('Users endpoints', function() {
  this.timeout(5000);
  let db;
  const {testUsers, testBooks, testProgress, testRatings} = helpers.makeFixtures();
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('Disconnect from db', () => db.destroy());

  before('Cleanup', () => helpers.cleanTables(db));

  afterEach('Cleanup', () => helpers.cleanTables(db));

  describe('POST /api/users/:user_id/, add book', () => {
    beforeEach('insert everything', () => helpers.seedTables(db, testUsers, testBooks, testProgress, testRatings));
    it('creates a book, responds 201 and the new book', () => {
      const testUser = testUsers[0];
      const newBook = {
        title: 'Words of Radiance',
        description: 'Book 2 of the Stormlight Archives',
        author: 'Brandon Sanderson'
      };
      //why isn't the date working? hm
      return supertest(app)
        .post(`/api/users/${testUser.id}/`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newBook)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('book_id');
          expect(res.body).to.have.property('progress_id');
          expect(res.body).to.have.property('rating_id');
          expect(res.body.title).to.eql(newBook.title);
          expect(res.body.description).to.eql(newBook.description);
          expect(res.body.author).to.eql(newBook.author);
          expect(res.headers.location).to.eql(`/api/users/${testUser.id}/books/${res.body.book_id}`);
          expect(res.body.user_id).to.eql(testUser.id);
          expect(res.body.percent).to.eql(0);
          expect(res.body.reading_status).to.eql('in progress');
        })
        .expect(res => 
          db.from('books')
            .select('*')
            .where({id: res.body.book_id})
            .first()
            .then(row => {
              expect(row.title).to.eql(newBook.title);
              expect(row.description).to.eql(newBook.description);
              expect(row.author).to.eql(newBook.author);
            })
        )
        .expect(res => 
          db.from('progress')
            .select('*')
            .where({id: res.body.progress_id})
            .first()
            .then(row => {
              expect(row.book_id).to.eql(res.body.book_id);
              expect(row.user_id).to.eql(testUser.id);
              expect(row.percent).to.eql(0);
              expect(row.reading_status).to.eql('in progress');
            })
        );
    });

    const requiredFields = ['title', 'author', 'description'];
    requiredFields.forEach(field => {
      const testUser = testUsers[0];
      const newBook = {
        title: 'Words of Radiance',
        description: 'Book 2 of the Stormlight Archives',
        author: 'Brandon Sanderson'
      };
      it(`Responds with 400 and an error message when the ${field} is missing`, () => {
        delete newBook[field];
        return supertest(app)
          .post(`/api/users/${testUser.id}/`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newBook)
          .expect(400, {error: `Missing ${field} in request body`});
      });
    });
  });

  describe('PATCH /api/users/:user_id/books/:book_id, update book', () => {
    beforeEach('insert everything', () => helpers.seedTables(db, testUsers, testBooks, testProgress, testRatings));
    it('responds with 204 when updating rating', () => {
      let testUser = testUsers[0];
      let testBook = testBooks[0];
      let expectedBook = {
        title: testBook.title,
        description: testBook.description,
        status: 'completed',
        percent: 100,
        rating: 5,
        progress_id: 1,
        book_id: testBook.id
      };
      return supertest(app)
        .patch(`/api/users/${testUser.id}/books/${testBook.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({rating: 5})
        .expect(204)
        .then( () => supertest(app).get(`/api/users/${testUser.id}/books/${testBook.id}`).set('Authorization', helpers.makeAuthHeader(testUser)).expect([expectedBook]));
    });
  });

  describe('POST /api/users/, add users', () => {
    this.timeout(5000);
    context('User Validation', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(db, testUsers)
      );
      const requiredFields = ['username', 'password', 'email'];
      const testUser = testUsers[0];
      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test username',
          password: 'test password',
          email: 'test email'
        };

        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field];
          return supertest(app)
            .post('/api/users')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(registerAttemptBody)
            .expect(400, {error: `Missing ${field} in request body`});
        });
      });


      it('responds 400 \'Password must be longer than 8 characters\' when empty password', () => {
        const userShortPass = {
          username: 'test username',
          password: '12345678',
          email: 'test email',
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(userShortPass)
          .expect(400, {error: 'Password must be longer than 8 characters'});
      });

      it('responds 400 \'Password must be shorter than 72 characters\' when empty password', () => {
        const userLongPass = {
          username: 'test username',
          password: '*'.repeat(72),
          email: 'test email',
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(userLongPass)
          .expect(400, {error: 'Password must be less than 72 characters'});
      });

      it('responds 400 \'Password must not start or end with empty space\' when password starts with space', () => {
        const userSpaceFirstPass = {
          username: 'test username',
          password: ' 12345678',
          email: 'test email',
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(userSpaceFirstPass)
          .expect(400, {error: 'Password must not start or end with empty space'});
      });

      it('responds 400 \'Password must not start or end with empty space\' when password ends with space', () => {
        const userSpaceFirstPass = {
          username: 'test username',
          password: '12345678 ',
          email: 'test email',
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(userSpaceFirstPass)
          .expect(400, {error: 'Password must not start or end with empty space'});
      });

      it('responds 400 \'Password must contain 1 upper case, 1 lower case, and 1 special character\' when password fails regex', () => {
        const simplePass = {
          username: 'test username',
          password: 'simple123',
          email: 'test email',
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(simplePass)
          .expect(400, {error: 'Password must contain 1 upper case, 1 lower case, and 1 special character'});
      });

      it('responds \'Username already taken\' when username isn\'t unique', () => {
        const dupeUser = {
          username: testUser.username,
          password: 'Simple123!',
          email: 'test email'
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(dupeUser)
          .expect(400, {error: 'Username already taken'});
      });
    });
  });
});