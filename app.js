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
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')
const app = express();

app.enable('trust proxy')


app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// implement CORS
// we can also allow cors on the specific route
// we can add it as a middleware
// 

// we can allow this origin to create requests to this application
// and this is only works for simple requests get and post requests
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

// we have non simple requests, put patch delete, or requests that send cookies, or non standart headers
// they require pre flight phase
// app.use(cors({
//   origin: 'https://www.natours.com' 
// }))


// allowing complex requests puts, patchs, etc
// to all routes
// app.options('*'. cors())

// so here only the tours can be deleted, updated, put  
// app.options('api/v1/tours/:id', cors())

app.use(cors())

app.use(helmet())

app.use(
  helmet.contentSecurityPolicy({
  directives: {
  defaultSrc: ["'self'", 'https:', 'http:','data:', 'ws:'],
  baseUri: ["'self'"],
  fontSrc: ["'self'", 'https:','http:', 'data:'],
  scriptSrc: [
  "'self'",
  'https:',
  'http:',
  'blob:'],
  styleSrc: ["'self'", 'https:', 'http:',"'unsafe-inline'"]
  }
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

app.use('/api/', limiter);

app.use(express.json({ limit: '10kb'}));
// to get access to the cookie
app.use(cookieParser())

// allows us to send data from the form!
app.use(express.urlencoded({ extended: true , limit: '10kb'}))

app.use(mongoSanitize())

app.use(xss())

app.use(hpp({
  whitelist: [ 
    'duration'
  ]
}))

app.use(express.static(path.join(__dirname, 'public')));

// will compress all the text that will be sent for the client
// after deploying we will see
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
