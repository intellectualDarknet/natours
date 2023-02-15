

class ViewsController {
  getOverview = (req, res) => {
    res.status(200).render('base', {
      title: 'All Tours',
      user: 'Jonas'
    })
  }

  getTour = (req, res) => {
    res.status(200).render('tour', {
      title: 'All Forest Hiker Tour'
    })
  }
}

module.exports = new ViewsController();