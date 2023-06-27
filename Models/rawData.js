const mongoose = require('mongoose');

const rawDataSchema = new mongoose.Schema({
  data_string: {
    type: String,
    trim: true,
  },
  device_name:{
    type: String,
    trim: true,
  },
  instrument_id:{
    type: String,
    trim: true,
  },
  function_code:{
    type: String,
    trim: true,
  },
  starting_register:{
    type: String,
    trim: true,
  },
  created_at: {
    type: String,
  },
  created_date: {
    type: String,
  },
});

const RawData = mongoose.model('RawData', rawDataSchema);
module.exports = RawData;
