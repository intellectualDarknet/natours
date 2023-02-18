const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const AuthController = require('../controllers/authController.js')

const router = express.Router()

router.get('/', ViewsController.getOverview)
router.get('/tour/:slug', AuthController.protect, ViewsController.getTour)
router.get('/login', ViewsController.getLoginForm)

module.exports = router; 