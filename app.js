const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/rewierRoutes')
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const BookingController = require('./controllers/bookingController')
const bodyparser = require('body-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')
const app = express();
const cors = require('cors');
const bookingController = require('./controllers/bookingController');

app.enable('trust proxy')


app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


app.use(cors())

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this API, please try again in an hour',
});

app.use('/api', limiter);


app.post('/webhook-checkout', bodyparser.raw({ type: 'application/json'}), bookingController.webhookCheckout)

app.use(express.json({ limit: '10kb'}));

app.use(cookieParser())

app.use(express.urlencoded({ extended: true , limit: '10kb'}))

app.use(mongoSanitize())

app.use(xss())

app.use(hpp({
  whitelist: [ 
    'duration'
  ]
}))

app.use(express.static(path.join(__dirname, 'public')));

app.use(compression())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;
