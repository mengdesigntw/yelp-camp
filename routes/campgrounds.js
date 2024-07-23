const express = require('express');
const router = express.Router({ mergeParams: true });

//setting up multer and cloudinary destination
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

//import async wrapper
const { wrapAsync } = require('../utils/wrapAsync');

//import custom middleware
const { isLogIn, isCampgroundCreator, isValidCampground, validateCampground } = require('../middleware');

//import controllers
const campgrounds = require('../controllers/campgrounds');

router.route('/')
  .get(wrapAsync(campgrounds.index))
  .post(isLogIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.create));

router.get('/new', isLogIn, campgrounds.newForm);

router
  .route('/:id')
  .get(isValidCampground, wrapAsync(campgrounds.show))
  .put(isValidCampground, isLogIn, isCampgroundCreator, upload.array('image'), validateCampground, wrapAsync(campgrounds.update))
  .delete(isValidCampground, isLogIn, isCampgroundCreator, wrapAsync(campgrounds.remove));

router.get('/:id/edit', isValidCampground, isLogIn, isCampgroundCreator, wrapAsync(campgrounds.editForm));

module.exports = router;
