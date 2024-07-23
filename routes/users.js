const express = require('express');
const router = express.Router({ mergeParams: true });
const { wrapAsync } = require('../utils/wrapAsync');
const passport = require('passport');

//import custom middleware and controllers
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.registerForm)
    .post(wrapAsync(users.create));

    //passport.authenticate will clear all session
router.route('/login')
    .get(users.loginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;
