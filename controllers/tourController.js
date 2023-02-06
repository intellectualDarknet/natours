const fs = require('fs');
const Tour = require('../schema/tour-schema');

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {}
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {}
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        newTour
      }
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: "Invalid data set"
    })
  }

};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
