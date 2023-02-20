const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');


class ViewsController {
  getOverview = async (req, res) => {

    // get tour data from collection
    const tours = await Tour.find() 

    // 2 build template

    // 3 Render that template using tour data from 1
    res.status(200).render('overview', {
      title: 'All Tours', 
      tours
    })
  }

  getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug}).populate({
      path: 'reviews',
      fields: 'review rating user'
    })

    if (!tour) {
      return next(new AppError('There is no tour with that name', 404))
    }

    res.status(200).render('tour', {
      title: tour.name + ' tour',
      tour: tour
    })
  })

  getLoginForm = (req, res) => {
    res.status(200).render('login', {
      title: 'Log into your account'
    })
  }

  getAccount = (req, res) => {
    res.status(200).render('account', {
      title: ''
    })
  }

  updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    // dont write req.body cause we can put password in the db and easily use it
      name: req.body.name,
      email: req.body.email
    }, 
    { 
      new: true ,
      validator: true
    })
    // to update password we have another method
    console.log('body', req.body)
    //
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    })
  }) 
  
}

module.exports = new ViewsController();