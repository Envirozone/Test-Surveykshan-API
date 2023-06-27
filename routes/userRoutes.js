const express = require('express');

const {
  getAllUsers,
  loginUser,
  addNewUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controller/userController');

const router = express.Router();

router.route('/').get(getAllUsers)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

router.route('/login').post(loginUser)
router.route('/register').post(addNewUser)

module.exports = router;
