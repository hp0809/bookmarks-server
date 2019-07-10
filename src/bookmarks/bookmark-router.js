const express = require('express');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookURL = require('validator')


const bookmarksData = [
    {
        "id": "cjozyzcil0000lxygs3gyg2mr",
        "title": "Thinkful",
        "url": "https://www.thinkful.com",
        "description": "Think outside the classroom",
        "rating": 5
    },
    {
        "id": "cjozyzeqh0001lxygb8mhnvhz",
        "title": "Google",
        "url": "https://www.google.com",
        "description": "Where we find everything else",
        "rating": 4
    },
    {
        "id": "cjkzyzeqh0001lxygb8mhqvh3",
        "title": "MDN",
        "url": "https://developer.mozilla.org",
        "description": "The only place to find web documentation",
        "rating": 5
    },
    {
        "id": "cjxxajjye000004s7flnrqh7d",
        "title": "hello",
        "url": "https://repl.it/@HaliPower/youtube-example-1",
        "description": "hello",
        "rating": 3
    },
    {
        "id": "cjxxcazpo000104s7udv3fdwu",
        "title": "great website",
        "url": "https://www.greatwebsite.com",
        "description": "",
        "rating": 1
    }
]
bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarksData);
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

        bookmarksData.push(bookmark);
        logger.info(`Card with ${id} created`);

        res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark);
    })

    bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const {id} = req.params;
        const bookmark = bookmarksData.find(bm => bm.id == id);

        if(!bookmark) {
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Card not found');
        }
        res.json(bookmark);
    })
    .delete((req, res) => {
        const {id} = req.params;
        const bookmarksIndex = bookmarksData.findIndex(bm => bm.id == id);

        if(bookmarksIndex === -1) {
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Not found');
        }

        bookmarksData.splice(bookmarksIndex, 1);
        logger.info(`Card with id ${id} deleted`);
        res.status(204).end();
    })

    module.exports = bookmarksRouter;