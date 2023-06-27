const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');

const industriesSchema = new mongoose.Schema({
  industry_name: {
    type: String,
    unique: [true, 'Industry exist!'],
    dropDups: true,
    trim: true,
  },
  industry_category: {
    type: String,
    default: '',
    trim: true,
  },
  industry_type: {
    type: String,
    default: '',
    trim: true,
  },
  exceedance_notification_mail: {
    type: String,
    default: '',
    trim: true,
  },
  show_to_CPCB: {
    type: String,
    default: 'false',
    trim: true,
  },
  status_CPCB: {
    type: String,
    default: 'offline',
    trim: true,
  },
  status_SPCB: {
    type: String,
    default: 'offline',
    trim: true,
  },
  show_to_PCB: {
    type: String,
    default: 'true',
    trim: true,
  },
  industry_pb_id: {
    type: String,
    require:true,
    default: '',
    trim: true,
  },
  industry_as: {
    type: String,
    default: '',
    trim: true,
  },
  industry_partner: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  // location
  location_name: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  state: {
    type: String,
    default: '',
    trim: true,
  },
  pincode: {
    type: String,
    default: '',
    trim: true,
  },
  phone_number: {
    type: String,
    default: '',
    trim: true,
  },
  latitude: {
    type: String,
    default: '',
    trim: true,
  },
  longitude: {
    type: String,
    default: '',
    trim: true,
  },
  industry_code: {
    type: String,
    default: '',
    trim: true,
  },
  ganga_basin: {
    type: String,
    default: '',
    trim: true,
  },
  cameras: [
    {
      camera_ip: {
        type: String,
        default: '',
        trim: true,
      },
      channel: {
        type: String,
        default: '',
        trim: true,
      },
      user_name: {
        type: String,
        default: '',
        trim: true,
      },
      password: {
        type: String,
        default: '',
        trim: true,
      },
      live_stream_url: {
        type: String,
        default: '',
        trim: true,
      },
      model_number: {
        type: String,
        default: '',
        trim: true,
      },
      camera_company: {
        type: String,
        default: '',
        trim: true,
      },
      ptz: {
        type: Boolean,
        default: false,
      },
      zoom: {
        type: Boolean,
        default: false,
      },
      night_vision: {
        type: Boolean,
        default: false,
      },
      ip_camera: {
        type: Boolean,
        default: false,
      },
      connectivity_type: {
        type: String,
        default: '',
        trim: true,
      },
      bandwidth_available: {
        type: String,
        default: '',
        trim: true,
      },
      area: {
        type: String,
        default: '',
        trim: true,
      },
      location: {
        type: String,
        default: '',
        trim: true,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
  ],
  devices: [
    {
      device_name: {
        type: String,
        trim: true,
      },
      device_category: {
        type: String,
        trim: true,
      },
      device_supplier: {
        type: String,
        trim: true,
      },
      device_manufacturer: {
        type: String,
        trim: true,
      },
      device_model_number: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        trim: true,
        default: 'offline',
      },
      offline_status_record: [
        {
          from: {
            type: Number,
          },
          to: {
            type: Number,
          },
        },
      ],
      delay_status_record: [
        {
          from: {
            type: Number,
          },
          to: {
            type: Number,
          },
        },
      ],
      last_data_recived: {
        type: String,
        trim: true,
        default: '',
      },
      live_since: {
        type: String,
        trim: true,
        default: '',
      },
    },
  ],
});

const Industries = mongoose.model('Industries', industriesSchema);
module.exports = Industries;
