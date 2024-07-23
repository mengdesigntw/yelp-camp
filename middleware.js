const isLogIn = function (req, res, next) {
  if (!req.isAuthenticated()) {
    // console.log(req.path);
    // console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please sign in first');
    res.redirect('/login');
  } else {
    next();
  }
};

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//import model
const { Campground } = require('./models/campground');
const { Review } = require('./models/review');

const isCampgroundCreator = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground.creator.equals(req.user._id)) {
    req.flash('error', 'You do not have the permission to edit the campground');
    res.redirect(`/campgrounds/${campground._id}`);
  } else {
    next();
  }
};

const isReviewCreator = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.creator.equals(req.user._id)) {
    req.flash('error', 'You do not have the permission to edit the review');
    res.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};

const isValidCampground = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Sorry, the campground does not exist');
    res.redirect('/campgrounds');
  } else {
    next();
  }
};

//import Joi schema for server-side validation
const { campgroundSchema, reviewSchema } = require('./schema');
//import custom error class and async wrapper
const { ExpressError } = require('./utils/ExpressError');

const validateCampground = (req, res, next) => {
  const result = campgroundSchema.validate(req.body);
  if (result.error) {
    const errors = result.error.details; //output is array containing object
    const errorMsg = errors.map((error) => error.message).join();
    throw new ExpressError('Validation Failed(C)', 400, errorMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const errors = result.error.details; //output is array containing object
    const errorMsg = errors.map((error) => error.message).join();
    throw new ExpressError('Validation(R) Failed', 400, errorMsg);
  } else {
    next();
  }
};

module.exports = { isLogIn, storeReturnTo, isCampgroundCreator, isValidCampground, validateCampground, validateReview, isReviewCreator };
