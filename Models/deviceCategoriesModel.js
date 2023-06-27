const mongoose = require('mongoose');

const deviceCategoriesSchema = new mongoose.Schema({
  device_category_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
});

const Device_Categories = mongoose.model(
  'Device_Categories',
  deviceCategoriesSchema
);
module.exports = Device_Categories;
