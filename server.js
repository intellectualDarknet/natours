const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const Tour = require('./schema/tour-schema');

dotenv.config({ path: './config.env' });

mongoose.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true
  },
  err => {
    if (err) {
      console.log('mongoDB error connection', err);
    } else {
      console.log('MongoDB connected');
    }
  }
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
