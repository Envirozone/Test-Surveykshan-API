const express = require('express');

const { getAllIndustriesName } = require('../controller/allIndustryNames');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getAllIndustriesName);

module.exports = router;
