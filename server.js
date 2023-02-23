
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});


// heroku dino (container in which our app is running) restart every 24h in order to keep our app in a healthy state
// and it does it by sending sick term signal to our node app and app will shut down immediately
// and this can leave requests that are currently being processed in the air thats is not ideal

process.on('SIGTERM', () => {
  console.log('!#@!&* SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('Process terminated!')
  })
})