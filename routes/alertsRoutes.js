const express = require('express');

const { getAllAlerts } = require('../controller/alertsController');

//Route handlers for tour

const router = express.Router();

router.route('/').get(getAllAlerts);

module.exports = router;
