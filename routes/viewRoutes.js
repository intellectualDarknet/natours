const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const router = express.Router()

router.get('/overview', ViewsController.getOverview)
router.get('/tour', ViewsController.getTour)

module.exports = router; 