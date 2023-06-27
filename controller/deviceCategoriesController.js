const Device_Categories = require('../Models/deviceCategoriesModel');

exports.getDeviceCategories = async (req, res) => {
  try {
    const DeviceCategories = await Device_Categories.find(req.query);
    res.status(200).json({
      status: 'success',
      results: DeviceCategories.length,
      data: {
        device_categories: DeviceCategories,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getDeviceCategory = async (req, res) => {
  try {
    const DeviceCategory = await Device_Categories.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        device_category: DeviceCategory,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addDeviceCategory = async (req, res) => {
  try {
    const doc = await Device_Categories.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        device_category: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateDeviceCategory = async (req, res) => {
  try {
    const DeviceCategory = await Device_Categories.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(204).json({
      status: 'success',
      data: {
        device_category: DeviceCategory,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteDeviceCategory = async (req, res) => {
  try {
    await Device_Categories.findOneAndDelete({ _id: req.params.id });

    res.status(204).json({
      status: 'successfully deleted',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
