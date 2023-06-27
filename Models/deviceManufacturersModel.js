const mongoose = require('mongoose');

const deviceManufacturersSchema = new mongoose.Schema({
  device_manufacturer_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
});

const Device_Manufacturers = mongoose.model(
  'Device_Manufacturers',
  deviceManufacturersSchema
);
module.exports = Device_Manufacturers;
