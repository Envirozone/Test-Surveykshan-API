const express = require('express');

const {
  getAllIndustries,
  getIndustry,
  addNewIndustry,
  updateIndustry,
  deleteIndustry,
} = require('../controller/industriesController');

// Route handlers for tour

const router = express.Router();
router.route('/').get(getAllIndustries).post(addNewIndustry);
router
  .route('/:id')
  .get(getIndustry)
  .patch(updateIndustry)
  .delete(deleteIndustry);

module.exports = router;
