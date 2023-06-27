const mongoose = require('mongoose');

const pcbLogs = new mongoose.Schema({
  industry_name: {
    type: String,
    trim: true,
    default:"",
  },
  device_name: {
    type: String,
    trim: true,
    default:"",
  },
  data: {
    type: String,
    trim: true,
    default:"",
  },
  board: {
    type: String,
    trim: true,
    default:"",
  },
  status: {
    type: String,
    trim: true,
    default:"",
  },
  send:{
    type: Boolean,
    default:false,
  },
  message: {
    type: String,
    trim: true,
    default:"",
  },
  createdAt: {
    type: Number,
    default: null,
  },
});

const PCBLogs = mongoose.model('PCBLogs', pcbLogs);
module.exports = PCBLogs;
