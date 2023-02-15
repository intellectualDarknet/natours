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

  getTour = (req, res) => {
    res.status(200).render('tour', {
      title: 'All Forest Hiker Tour'
    })
  }
}

module.exports = new ViewsController();