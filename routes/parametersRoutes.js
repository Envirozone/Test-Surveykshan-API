const express = require('express');

const {
  getParameters,
  getParameter,
  addParameter,
  updateParameter,
  deleteParameter,
} = require('../controller/parametersController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getParameters).post(addParameter);
router
  .route('/:id')
  .get(getParameter)
  .patch(updateParameter)
  .delete(deleteParameter);

module.exports = router;
