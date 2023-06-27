const mongoose = require('mongoose');

const parametersSchema = new mongoose.Schema({
  parameter_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
  parameter_full_name: {
    type: String,
    unique: true,
    dropDups: true,
    default: '',
    trim: true,
  },
  parameter_unit:{
    type: String,
    trim: true,
  },
});

const Parameters = mongoose.model('Parameters', parametersSchema);
module.exports = Parameters;
