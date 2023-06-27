const express = require('express');

const { updateIndustryStatus } = require('../controller/updateIndustryStatus');
const {
  updateIndustrySpcbStatus,
} = require('../controller/updateIndustrySpcbStatus');
const {
  updateIndustryCpcbStatus,
} = require('../controller/updateIndustryCpcbStatus');

const router = express.Router();

router.route('/industry_status').get(updateIndustryStatus);
router.route('/spcb_status').get(updateIndustrySpcbStatus);
router.route('/cpcb_status').get(updateIndustryCpcbStatus);

module.exports = router;
