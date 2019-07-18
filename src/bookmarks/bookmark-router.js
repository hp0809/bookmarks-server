const express = require('express');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookURL = require('validator');

const bookmarksData = require('./store')

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarksData.bookmarks);
    })
    .post(bodyParser, (req, res) => {
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

        bookmarksData.bookmarks.push(bookmark);
        logger.info(`Bookmark with ${id} created`);

        res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark);
    })

    bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const {id} = req.params;
        const bookmark = bookmarksData.bookmarks.find(bm => bm.id == id);

        if(!bookmark) {
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(404).send( {
            error: { message: `Bookmark Not Found` }
          });
        }
        res.json(bookmark);
    })
    .delete((req, res) => {
        const {id} = req.params;
        const bookmarksIndex = bookmarksData.bookmarks.findIndex(bm => bm.id == id);

        if(bookmarksIndex === -1) {
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(404).send('Not found');
        }

        bookmarksData.bookmarks.splice(bookmarksIndex, 1);
        logger.info(`Bookmark with id ${id} deleted`);
        res.status(204).end();
    })

    module.exports = bookmarksRouter;