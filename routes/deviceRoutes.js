const express = require('express');

const {
  addNewDevice,
  deleteDevice,
  getAllDevicesData,
  updateDevice,
  getDevicesByIndustryID,
  getDeviceByIndustryIDAndDeviceID,
  getAllDevicesIdAndName,
} = require('../controller/deviceController');

// Route handlers for tour

const router = express.Router();

router.route('/get_all_devices_idname').get(getAllDevicesIdAndName);
router.route('/get_all_devices_data').get(getAllDevicesData);
router.route('/:id').patch(addNewDevice);
router.route('/:industry_id').get(getDevicesByIndustryID);
router.route('/:industry_id/:device_id').get(getDeviceByIndustryIDAndDeviceID);
router.route('/delete/:industry_id/:device_id').patch(deleteDevice);
router.route('/update/:industry_id/:device_id').patch(updateDevice);
module.exports = router;
