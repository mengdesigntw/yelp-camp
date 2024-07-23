if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//setting up express app environment
const express = require('express');
const app = express();

//set view directory and view engines
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setting port and make sure it works
const port = 3000;
app.listen(port, () => {
  console.log(`app is listening on Port ${port}`);
});

//setting up public dir to serve static files
app.use(express.static(path.join(__dirname, 'public')));

//connect mongoose
const dbURL = 'mongodb://127.0.0.1:27017/yelp-camp';
const mongoose = require('mongoose');
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbURL);
  console.log('mongo connection open');
}

//import models
const { User } = require('./models/user');

//parsing data
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//prevent mongo injection
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

//setting method override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//setting up template engine
const engine = require('ejs-mate');
app.engine('ejs', engine);

//setting up session and config
const session = require('express-session');
const MongoStore = require('connect-mongo');
const storeConfig = {
  mongoUrl: dbURL,
  touchAfter: 24 * 3600,
  crypto: {
    secret: 'asecretkey'
  }
}
const sessionConfig = {
  store: MongoStore.create(storeConfig),
  name: 'camp',
  secret: 'asecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

//setting up auth with passport
//session should be required before passport
const passport = require('passport');
const LocalStrategy = require('passport-local');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up flash
const flash = require('connect-flash');
app.use(flash());

//security
const helmet = require('helmet');
app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net',
];
const connectSrcUrls = ['https://api.mapbox.com/', 'https://a.tiles.mapbox.com/', 'https://b.tiles.mapbox.com/', 'https://events.mapbox.com/'];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dkiqet71x/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//always have local variable to use
//passport should be required before req.user
app.use((req, res, next) => {
  // console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//import custom error class
const { ExpressError } = require('./utils/ExpressError');

// import routes and setup the middleware
const campgroundsRouter = require('./routes/campgrounds');
app.use('/campgrounds', campgroundsRouter);
const reviewsRouter = require('./routes/reviews');
app.use('/campgrounds/:id/reviews', reviewsRouter);
const usersRouter = require('./routes/users');
app.use('/', usersRouter);

app.get('/', (req, res) => {
  res.render('./home.ejs');
});

//if all routes above are not called, then the page is not existed.
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404, "The requested page doesn't exist"));
});

//custom error handler
app.use((err, req, res, next) => {
  const { name = 'custom error', stack, status = 500, message = 'something wrong' } = err;
  // console.log({ ...err });
  res.status(status);
  res.render('./error.ejs', { name, status, message, stack });
});
