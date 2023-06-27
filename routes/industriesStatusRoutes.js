const express = require('express');
const {
    getIndustriesStatus,
    getIndustriesStatusReport,
    getIndustriesStatusByIndustryId,
    updateIndustriesStatusManually,
} = require('../controller/industriesStatus');

const router = express.Router();

router.route('/update/:industry_id/:device_id/:industry_status').post(updateIndustriesStatusManually);
router.route('/industry_status_report').get(getIndustriesStatusReport);
router.route('/').get(getIndustriesStatus);
router.route('/get_status_by_id/:industry_id').get(getIndustriesStatusByIndustryId);

module.exports = router;
