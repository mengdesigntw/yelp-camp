const { User } = require('../models/user');

const registerForm = (req, res) => {
  res.render('./users/register.ejs');
};

const create = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await new User({ username, email });
    const registerUser = await User.register(user, password);
    req.login(registerUser, (err) => {
      if (err) {
        next(err);
      } else {
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
      }
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
};

const loginForm = (req, res) => {
  res.render('./users/login.ejs');
};

const login = (req, res) => {
  req.flash('success', 'Welcome Back!');
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'See you next time!');
      res.redirect('/campgrounds');
    }
  });
};
module.exports = { registerForm, create, loginForm, login, logout };
