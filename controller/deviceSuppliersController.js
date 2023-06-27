const Device_Suppliers = require('../Models/deviceSuppliersModel');

exports.getDeviceSuppliers = async (req, res) => {
  try {
    const DeviceSuppliers = await Device_Suppliers.find(req.query);
    res.status(200).json({
      status: 'success',
      results: DeviceSuppliers.length,
      data: {
        device_Suppliers: DeviceSuppliers,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getDeviceSupplier = async (req, res) => {
  try {
    const DeviceSupplier = await Device_Suppliers.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        device_supplier: DeviceSupplier,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addDeviceSupplier = async (req, res) => {
  try {
    const doc = await Device_Suppliers.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        device_supplier: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateDeviceSupplier = async (req, res) => {
  try {
    const DeviceSupplier = await Device_Suppliers.findByIdAndUpdate(
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
        device_supplier: DeviceSupplier,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteDeviceSupplier = async (req, res) => {
  try {
    await Device_Suppliers.findOneAndDelete({ _id: req.params.id });

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
