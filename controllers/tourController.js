const fs = require('fs');
const Tour = require('../schema/tour-schema');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find()

    res.status(200).json({
      status: 'success',
      data: {
        tours
      }
    }); 
  } catch(e) {
    res.status(404).json({
      status: 'fail',
      message: e
    })
  }

  res.status(200).json({
    status: 'success',
    data: {}
  });
};

exports.getTour = async (req, res) => {

  try {
    // findById the same thing as find({ _id: value})
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
 
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
      message: "Invalid data set",
      error: err
    })
  }

};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });
  } catch(e) {
    res.status(400).json({
      status: 'fail',
      message: "Invalid data set"
    })
  }

};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: deletedTour
    });
  } catch(error) {
    res.status(400).json({
      status: 'success',
      message: error
    });
  }
};
