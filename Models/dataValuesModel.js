const mongoose = require('mongoose');

const dataValuesSchema = new mongoose.Schema({
  device_name: {
    type: String,
    trim: true,
  },
  instrument_id: {
    type: String,
    trim: true,
  },
  function_code: {
    type: String,
    trim: true,
  },
  starting_register: {
    type: String,
    trim: true,
  },
  station_name: {
    type: String,
    trim: true,
  },
  data_values: {
    type: Object,
  },
  created_at: {
    type: String,
  },
  created_mili: {
    type: Number,
  },
});

const dataValues = mongoose.model('dataValues', dataValuesSchema);
module.exports = dataValues;
