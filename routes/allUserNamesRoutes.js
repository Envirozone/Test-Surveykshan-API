const express = require('express');

const { getAllUserName } = require('../controller/allUserNames');

//Route handlers for tour

const router = express.Router();
router.route('/').get(getAllUserName);

module.exports = router;
