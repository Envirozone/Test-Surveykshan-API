const express = require('express');

const {
  getDeviceManufacturers,
  getDeviceManufacturer,
  addDeviceManufacturer,
  updateDeviceManufacturer,
  deleteDeviceManufacturer,
} = require('../controller/deviceManufacturersController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getDeviceManufacturers).post(addDeviceManufacturer);
router
  .route('/:id')
  .get(getDeviceManufacturer)
  .patch(updateDeviceManufacturer)
  .delete(deleteDeviceManufacturer);

module.exports = router;
