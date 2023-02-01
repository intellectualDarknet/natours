const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();


//set security HTTP headers 
app.use(helmet())

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  // max should depend on our APP requests
  max: 100,
  // allow 100 request per 1h
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this API, please try again in an hour',
});


//use before every request GG
// in this case use for api
app.use('/api/', limiter);

// Body parse, reading data from body into req.body
// limits our requets we can sent only 10kb the same thing
// according to the our app request
app.use(express.json({ limit: '10kb'}));

// Data sanitization against noSQL query injection
// filters all the $ and .
app.use(mongoSanitize())

// Data sanitization agains XSS
// will clean input from malicious html code with jscode attached to it
// if it will occur in the html page the script will work
// mongoose validation is good protection against xss

app.use(xss())


// Prevent parameter pollution
// removes repeating parametres
// but we can whitelist some
app.use(hpp({
  whitelist: [
    'duration'
  ]
}))

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
