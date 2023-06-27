const express = require('express');

const {
  getPartners,
  getPartner,
  addPartner,
  updatePartner,
  deletePartner,
} = require('../controller/partnersController');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getPartners).post(addPartner);
router
  .route('/:id')
  .get(getPartner)
  .patch(updatePartner)
  .delete(deletePartner);

module.exports = router;
