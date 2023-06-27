const express = require('express');

const { sendDataToBihar } = require('../controller/toBiharController');
const { sendDataToCpcb } = require('../controller/toCpcbController');
const { sendDataToDelhi } = require('../controller/toDelhiController');
const { sendDataToHaryana } = require('../controller/toHaryanaController');
const { sendDataToJharkhand } = require('../controller/toJharkhandController');
const {
  sendDataToMaharashtra,
} = require('../controller/toMaharashtraController');
const { sendDataToPunjab } = require('../controller/toPunjabController');
const { sendDataToRajasthan } = require('../controller/toRajasthanController');

const router = express.Router();

router.route('/send_to_bihar').get(sendDataToBihar);
router.route('/send_to_cpcb').get(sendDataToCpcb);
router.route('/send_to_delhi').get(sendDataToDelhi);
router.route('/send_to_haryana').get(sendDataToHaryana);
router.route('/send_to_jharkhand').get(sendDataToJharkhand);
router.route('/send_to_maharashtra').get(sendDataToMaharashtra);
router.route('/send_to_punjab').get(sendDataToPunjab);
router.route('/send_to_rajasthan').get(sendDataToRajasthan);

module.exports = router;
