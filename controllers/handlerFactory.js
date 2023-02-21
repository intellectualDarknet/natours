const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const { Model } = require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: null
  });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  console.log('updateOne')
  console.log('request file', req.file)
  console.log('request body', req.body)
    const doc = await Model.findByIdAndUpdate(req.params.id || req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model => catchAsync(async (req, res, next) => {
  const newTour = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newTour
  });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id)
  if (popOptions) query = query.populate(popOptions)
  const doc = await query

  if (!doc) {
    return next(new AppError(`No model found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: doc
  });
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
  // to allow for nested GET reviews on tour
  let filter = {}
  if (req.params.tourId) filter = { tour: req.params.tourId }

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    // to find exact docums with the definite params we need to loop throught all the docs
    // in big bases it will affect the time so we can create indexes
    // by default id has special table of only indexes so we this is why looking only by id works faster than by any 
    // another unique field

    // add explain to look general information about the query (elems looped ets)
  const doc = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc
  });
});