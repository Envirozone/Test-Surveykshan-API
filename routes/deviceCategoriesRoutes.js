const express = require('express');

const {
  getDeviceCategories,
  getDeviceCategory,
  addDeviceCategory,
  updateDeviceCategory,
  deleteDeviceCategory,
} = require('../controller/deviceCategoriesController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getDeviceCategories).post(addDeviceCategory);
router
  .route('/:id')
  .get(getDeviceCategory)
  .patch(updateDeviceCategory)
  .delete(deleteDeviceCategory);

module.exports = router;
