const Device_Manufacturers = require('../Models/deviceManufacturersModel');

exports.getDeviceManufacturers = async (req, res) => {
  try {
    const DeviceManufacturers = await Device_Manufacturers.find(req.query);
    res.status(200).json({
      status: 'success',
      results: DeviceManufacturers.length,
      data: {
        device_Manufacturers: DeviceManufacturers,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getDeviceManufacturer = async (req, res) => {
  try {
    const DeviceManufacturer = await Device_Manufacturers.findById(
      req.params.id
    );
    res.status(200).json({
      status: 'success',
      data: {
        device_manufacturer: DeviceManufacturer,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addDeviceManufacturer = async (req, res) => {
  try {
    const doc = await Device_Manufacturers.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        device_manufacturer: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateDeviceManufacturer = async (req, res) => {
  try {
    const DeviceManufacturer = await Device_Manufacturers.findByIdAndUpdate(
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
        device_manufacturer: DeviceManufacturer,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteDeviceManufacturer = async (req, res) => {
  try {
    await Device_Manufacturers.findOneAndDelete({ _id: req.params.id });

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
