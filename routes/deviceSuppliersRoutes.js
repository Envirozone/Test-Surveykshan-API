const express = require('express');

const {
  getDeviceSuppliers,
  getDeviceSupplier,
  addDeviceSupplier,
  updateDeviceSupplier,
  deleteDeviceSupplier,
} = require('../controller/deviceSuppliersController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getDeviceSuppliers).post(addDeviceSupplier);
router
  .route('/:id')
  .get(getDeviceSupplier)
  .patch(updateDeviceSupplier)
  .delete(deleteDeviceSupplier);

module.exports = router;
