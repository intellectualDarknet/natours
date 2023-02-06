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

const testTour = new Tour({
  name: 'The Park Camper',
  price: 997
});

testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('Error', err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
