const express = require('express');

const {
  getAllDataSettings,
  addNewDatasetting,
  updateDataSetting,
  updateParametersByDeviceName,
  deleteDataSetting,
  getParametersByDevice,
  getDataSettingByDeviceAndParameter,
  getDataSettingsFromDeviceName
} = require('../controller/dataSettingController');

//Route handlers for tour

const router = express.Router();

router.route('/').get(getAllDataSettings);
router.route('/by/device/:device_name').get(getDataSettingsFromDeviceName);
router.route('/:device_name').get(getParametersByDevice);
router.route('/:dataSetting_id/:parameter_id').get(getDataSettingByDeviceAndParameter);
router.route('/').post(addNewDatasetting);
router.route('/update/:device_name').post(updateParametersByDeviceName);
router.route('/update/:dataSetting_id/:parameter_id').patch(updateDataSetting);
router.route('/delete/:dataSetting_id/:parameter_id').patch(deleteDataSetting);

module.exports = router;
