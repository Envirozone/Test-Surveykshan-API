const express = require('express');

const {
  getAllCamerasData,
  getAllCamerasByIndustryId,
  getCameraByIndustryIDAndDeviceID,
  addNewCamera,
  updateCamera,
  deleteCamera,
} = require('../controller/cameraController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getAllCamerasData);
router.route('/:industry_id').get(getAllCamerasByIndustryId);
router.route('/:industry_id/:camera_id').get(getCameraByIndustryIDAndDeviceID);
router.route('/:industry_id').post(addNewCamera);
router.route('/update/:industry_id/:camera_id').patch(updateCamera);
router.route('/delete/:industry_id/:camera_id').patch(deleteCamera);

module.exports = router;
