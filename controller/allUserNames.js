const User = require('../Models/userModel');

exports.getAllUserName = async (req, res) => {
  try {
    let userNames = [];
    const allUser = await User.find();
    allUser.forEach((user) => {
      let newUser = {};
      newUser.username = user.username;
      newUser._id = user._id;
      userNames.push(newUser);
      newUser = {};
    });

    res.status(200).json({
      status: 'success',
      results: userNames.length,
      data: {
        user_names: userNames,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
