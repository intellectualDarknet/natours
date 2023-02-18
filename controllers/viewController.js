const Tour = require('../models/tourModel')
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

    console.log('getTour', tour)

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
  
}

module.exports = new ViewsController();