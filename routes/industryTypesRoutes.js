const express = require('express');

const {
  getIndustryTypes,
  getIndustryType,
  addIndustryType,
  updateIndustryType,
  deleteIndustryType,
} = require('../controller/industryTypeController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getIndustryTypes).post(addIndustryType);
router
  .route('/:id')
  .get(getIndustryType)
  .patch(updateIndustryType)
  .delete(deleteIndustryType);

module.exports = router;
