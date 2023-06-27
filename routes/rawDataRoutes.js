const express = require('express');

const {
  getAllRawData,
  getAllRawDataByDeviceName,
  insertRawDataString,
  getDataValuesByDeviceName,
  updateDataFromCSV,
} = require('../controller/rawDataController');

const router = express.Router();
router.route('/:arr_length').get(getAllRawData);
router.route('/by_device/:arr_length').get(getAllRawDataByDeviceName);
router.route('/').post(insertRawDataString);
router.route('/csv-update/:parameters/:device_name').post(updateDataFromCSV);
router.route('/:device_name/:interval/:start_date/:end_date/:start_time/:end_time').get(getDataValuesByDeviceName);

module.exports = router;