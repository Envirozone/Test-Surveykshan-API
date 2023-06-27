const mongoose = require('mongoose');

const dataSettingThird = new mongoose.Schema({
  industry_name: {
    type: String,
    trim: true,
  },
  industry_id: {
    type: String,
    trim: true,
  },
  device_name: {
    type: String,
    trim: true,
  },
  device_id: {
    type: String,
    trim: true,
  },
  parameters: [
    {
      instrument: {
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
      industry_pb_id: {
        type: String,
        trim: true,
        default: '',
      },
      station_pb_id: {
        type: String,
        trim: true,
        default: '',
      },
      device_pb_id: {
        type: String,
        trim: true,
        default: '',
      },
      device_param_pb_id: {
        type: String,
        trim: true,
        default: '',
      },
      site_id: {
        type: String,
        trim: true,
        default: '',
      },
      site_uid: {
        type: String,
        trim: true,
        default: '',
      },
      monitoring_id: {
        type: String,
        trim: true,
        default: '',
      },
      analyzer_id: {
        type: String,
        trim: true,
        default: '',
      },
      parameter_pb_id: {
        type: String,
        trim: true,
        default: '',
      },
      unit_id: {
        type: String,
        trim: true,
        default: '',
      },
      key: {
        type: String,
        trim: true,
        default: '',
      },
      parameter_custom_name: {
        type: String,
        trim: true,
        default: '',
      },
      sequence_number: {
        type: String,
        trim: true,
        default: null,
      },
      Number_of_bytes: {
        type: String,
        trim: true,
        default: null,
      },
      holding_register_number: {
        type: String,
        trim: true,
        default: null,
      },
      starting_register: {
        type: String,
        trim: true,
        default: null,
      },
      function_value: {
        type: String,
        trim: true,
        default: null,
      },
      min_std_value: {
        type: String,
        trim: true,
        default: null,
      },
      max_std_value: {
        type: String,
        trim: true,
        default: null,
      },
      multiplication_factor: {
        type: String,
        trim: true,
        default: null,
      },
      conversion_type: {
        type: String,
        trim: true,
        default: null,
      },
      constant_value_420: {
        type: String,
        trim: true,
        default: null,
      },
      range_420: {
        type: String,
        trim: true,
        default: null,
      },
      constant_subtraction_420: {
        type: String,
        trim: true,
        default: null,
      },
      to_pcb: {
        type: String,
        trim: true,
        default: null,
      },
      byte_reading_order: {
        type: String,
        trim: true,
        default: null,
      },
      min_vaild_value: {
        type: String,
        trim: true,
        default: null,
      },
      max_valid_value: {
        type: String,
        trim: true,
        default: null,
      },
      z_data: {
        type: String,
        trim: true,
        default: null,
      },
      status: {
        type: String,
        trim: true,
        default: null,
      },
      parameter_status: {
        type: String,
        trim: true,
        default: null,
      },
      device_status: {
        type: String,
        trim: true,
        default: null,
      },
      client_status: {
        type: String,
        trim: true,
        default: null,
      },
      to_cpcb: {
        type: String,
        trim: true,
        default: null,
      },
      two_way_communication: {
        type: String,
        trim: true,
        default: null,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const DataSettingThird = mongoose.model('DataSettingThird', dataSettingThird);
module.exports = DataSettingThird;
