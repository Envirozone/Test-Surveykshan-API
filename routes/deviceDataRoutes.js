const express = require('express');

const {
    getDeviceData,
    getDeviceDataObj
} = require('../controller/deviceDataController');

const router = express.Router();

router.route('/:device_name').get(getDeviceData);
router.route('/data_object/:device_name').get(getDeviceDataObj);
module.exports = router;
