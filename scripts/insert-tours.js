const fs = require('fs')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../schema/tour');
dotenv.config({ path: './config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))
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
      if (process.argv[2] == '--import') {
        importData()
      } else if (process.argv[2] == '--delete') {
        deleteData()
      }
    }
  }
);

const importData = async () => {
  try {
    await Tour.insertMany(tours)
    console.log('Data successfully loaded!')
  } catch (error) {
    console.log(error)
  }
}
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data successfully deleted!')
  } catch (error) {
    console.log(error)
  }
}



// we can use node to import this file withoud require or export
// node path --import
// $ node scripts/insert-tours.js --import
// $ node scripts/insert-tours.js --delete

