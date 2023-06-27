const express = require('express');

const {
    getAllPCBLogs,
    getAllPCBLogsByDevice,
    getLastSuccessPCBLogByDeviceName,
} = require('../controller/pcbLogsController');

const router = express.Router();

router.route('/').get(getAllPCBLogs);
router.route('/by_device').get(getAllPCBLogsByDevice);
router.route('/last_data_by_device').get(getLastSuccessPCBLogByDeviceName);

module.exports = router;
