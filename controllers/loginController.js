const catchAsync = require("../utils/catchAsync")


class LoginController {
  getLoginForm = catchAsync((req, res, next) => {

    res.status(200).render('login')
  })
}

module.exports = new LoginController()