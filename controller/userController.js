const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    // const filterObj = req.query
    const allUsers = await User.find(req.query);
    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: {
        users: allUsers,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: "success",
      results: user.length,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    // Get user input
    const { username, password } = req.body;
    // Validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ username });
    if (!user) {
      res.status(200).json({ status: "failed", msg: "Invalid usename" });
    } else if (await bcrypt.compare(password, user.password)) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // user
      res.status(200).json({ ...user._doc, token, status: "success" });
    } else {
      res.status(200).json({ status: "failed", msg: "Invalid password" });
    }
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.addNewUser = async (req, res) => {
  // try {
  //   const doc = await User.create(req.body);
  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       User: doc,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'Failed',
  //     message: error.message,
  //   });
  // }
  try {
    const { username, password } = req.body;

    // Validate user input
    // if (!(username && password )) {
    //   res.status(400).send("All input is required");
    // }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await User.findOne({ username });
    // if (oldUser) {
    //   return res.status(409).send("User Already Exist. Please Login");
    // }

    const encryptedPassword = await bcrypt.hash(`${password}`, 10);

    // Create user in our database
    let user = await User.create({
      ...req.body,
      subscribtions: [
        {
          from: req.body.from,
          till: req.body.till,
          parameters: req.body.parameters,
        },
      ],
      passwordStr: password,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    res.status(201).json({ ...user._doc, token });
  } catch (error) {
    res.status(201).json(error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const encryptedPassword = await bcrypt.hash(`${req.body.password}`, 10);
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        password: encryptedPassword,
        passwordStr: req.body.password,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(204).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id });

    res.status(204).json({
      status: "successfully deleted",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};
