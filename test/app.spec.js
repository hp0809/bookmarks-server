const app = require('../src/app')
const bookmarksData = require('../src/bookmarks/store');

describe('Bookmarks Endpoints', () => {
  

  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = bookmarksData.bookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const aBookmark = bookmarksData.bookmarks[1]
      return supertest(app)
        .delete(`/bookmarks/${aBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
  })

  describe('GET /bookmarks', () => {
    it('gets the bookmarks from the bookmarksData', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(200)
    })
  })

  describe('GET /bookmarks/:id', () => {
    it('gets the bookmark by ID from the bookmarksData', () => {
      const secondBookmark = bookmarksData.bookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(200)
    })

    it(`returns 404 whe bookmark doesn't exist`, () => {
      return supertest(app)
        .get(`/bookmarks/0`)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(404)
    })
  })

  describe('DELETE /bookmarks/:id', () => {
    it('removes the bookmark by ID from the bookmarksData', () => {
      const secondBookmark = bookmarksData.bookmarks[1]
      const expectedBookmarks = bookmarksData.bookmarks.filter(s => s.id !== secondBookmark.id)
      return supertest(app)
        .delete(`/bookmarks/${secondBookmark.id}`)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(204)
        .then(() => {
          expect(bookmarksData.bookmarks).to.eql(expectedBookmarks)
        })
    })

    it(`returns 404 when bookmark doesn't exist`, () => {
      return supertest(app)
        .delete(`/bookmarks/0`)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(404)
    })
  })

  describe('POST /bookmarks', () => {
    it(`responds with 400 missing 'title' if not supplied`, () => {
      const newBookmarkMissingTitle = {
        title: '',
        url: 'https://test.com',
        rating: 1,
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkMissingTitle)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(400)
    })

    it(`responds with 400 missing 'url' if not supplied`, () => {
      const newBookmarkMissingUrl = {
        title: 'test-title',
        url: "",
        rating: 1,
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkMissingUrl)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(400)
    })

    it(`responds with 400 missing 'rating' if not supplied`, () => {
      const newBookmarkMissingRating = {
        title: 'test-title',
        url: 'https://test.com',
        rating: ""
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkMissingRating)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(400)
    })

    it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
      const newBookmarkInvalidRating = {
        title: 'test-title',
        url: 'https://test.com',
        rating: 0
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkInvalidRating)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(400)
    })

    it(`responds with 400 invalid 'url' if not a valid URL`, () => {
      const newBookmarkInvalidUrl = {
        title: 'test-title',
        url: 'htp://invalid-url',
        rating: 1,
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkInvalidUrl)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(400)
    })

    it('adds a new bookmark to the bookmarksData', () => {
      const newBookmark = {
        title: 'test-title',
        url: 'test.com',
        description: 'test description',
        rating: 1,
      }
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmark)
        .set('Authorization', `${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body.id).to.be.a('string')
        })
        .then(res => {
          expect(bookmarksData.bookmarks[bookmarksData.bookmarks.length - 1]).to.eql(res.body)
        })
    })
  })
})