const catchAsync = require("../utils/catchAsync")


class LoginController {

  getLoginForm = (req, res) => {
    res.status(200).render('login', {
      title: 'Log into your account'
    })
  }

  getSignupForm = (req, res) => {
    res.status(200).render('signup', {
      title: 'Sign up to your account'
    })
  }
}

module.exports = new LoginController()