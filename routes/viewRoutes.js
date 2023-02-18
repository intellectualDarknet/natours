const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const AuthController = require('../controllers/authController.js');

const router = express.Router()


router.use(AuthController.isLoggedIn)

router.get('/', ViewsController.getOverview)
router.get('/login', ViewsController.getLoginForm)
router.get('/tour/:slug', ViewsController.getTour)

module.exports = router; 