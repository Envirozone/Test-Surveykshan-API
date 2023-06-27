const express = require('express');

const {
  getIndustryCategories,
  getIndustryCategory,
  addIndustryCategory,
  updateIndustryCategory,
  deleteIndustryCategory,
} = require('../controller/industryCategoriesController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getIndustryCategories).post(addIndustryCategory);
router
  .route('/:id')
  .get(getIndustryCategory)
  .patch(updateIndustryCategory)
  .delete(deleteIndustryCategory);

module.exports = router;
