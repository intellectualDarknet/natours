const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const router = express.Router()

router.get('/', ViewsController.getOverview)
router.get('/tour/:slug', ViewsController.getTour)

module.exports = router; 