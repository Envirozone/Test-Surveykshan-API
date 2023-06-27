const mongoose = require('mongoose');

const alerts = new mongoose.Schema({
  industry_name: {
    type: String,
    trim: true,
    default: '',
  },
  device_name: {
    type: String,
    trim: true,
    default: '',
  },
  parameter_name: {
    type: String,
    trim: true,
    default: '',
  },
  station_name: {
    type: String,
    trim: true,
    default: '',
  },
  alert_type: {
    type: String,
    trim: true,
    default: '',
  },
  body: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Number,
    default: null,
  },
});

const Alerts = mongoose.model('Alerts', alerts);
module.exports = Alerts;
