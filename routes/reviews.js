const express = require('express');
const router = express.Router({ mergeParams: true });

//import async wrapper
const { wrapAsync } = require('../utils/wrapAsync');
//import custom middleware
const { validateReview, isLogIn, isReviewCreator } = require('../middleware');
//import controllers
const reviews = require('../controllers/reviews');

router.post('/', isLogIn, validateReview, wrapAsync(reviews.create));

router.delete('/:reviewId', isLogIn, isReviewCreator, wrapAsync(reviews.remove));

module.exports = router;
