const express = require('express');

const { sendInactiveSMSToPiyush } = require('../controller/sendSMSController');

const router = express.Router();

router.route('/piyush/inactive_50').get(sendInactiveSMSToPiyush);

module.exports = router;
