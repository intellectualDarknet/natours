const fs = require('fs');
const Tour = require('../schema/tour-schema');

exports.checkBody = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {}
  });
  next();
};

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

exports.createTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {}
  });
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
