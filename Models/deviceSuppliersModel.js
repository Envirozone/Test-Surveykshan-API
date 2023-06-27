const mongoose = require('mongoose');

const deviceSuppliersSchema = new mongoose.Schema({
  device_supplier_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
});

const Device_Suppliers = mongoose.model(
  'Device_Suppliers',
  deviceSuppliersSchema
);
module.exports = Device_Suppliers;
