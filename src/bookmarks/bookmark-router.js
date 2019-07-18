const express = require('express');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookURL = require('validator');
const BookmarksService = require('../bookmarks-service');
const xss = require('xss');

const bookmarksData = require('./store')

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
  })

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                    res.json(bookmarks.map(serializeBookmark))
                })
            .catch(next)
    })

    .post(bodyParser , (req, res, next) => {
        const {title, url, description, rating} = req.body;
        const id = uuid();

        if(!title) {
            logger.error('Title is required');
            return res.status(400).send('Invalid data');
        }
        if(!url) {
            logger.error('URL is required');
            return res.status(400).send('Invalid data');
        }
        if(!bookURL.isURL(url)) {
            logger.error('Valid URL is required');
            return res.status(400).send('Invalid data');
        }
        if(!rating) {
            logger.error('Rating is required');
            return res.status(400).send('Invalid data');
        }

        const ratingNum = parseFloat(rating);
        
        if(Number.isNaN(ratingNum)) {
            logger.error('Value for rating must be numeric');
            return res.status(400).send('Invalid data');
        }

        if(ratingNum < 1 || ratingNum > 5) {
            logger.error('Rating must be between 1 and 5');
            return res.status(400).send('Invalid data');
        }

        const bookmark = {
            id,
            title,
            description,
            rating
        };

        
        const newBookmark = { title, url, description, rating}
        
        BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        logger.info(`Bookmark with id ${bookmark.id} created.`)
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.getById(req.app.get('db'), bookmark_id)
        .then(bookmark => {
            if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res.status(404).json({
                error: { message: `Bookmark Not Found` }
            })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)
    })
    .get((req, res) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.deleteBookmark(
        req.app.get('db'),
        bookmark_id
        )
        .then(numRowsAffected => {
            logger.info(`Bookmark with id ${bookmark_id} deleted.`)
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = bookmarksRouter