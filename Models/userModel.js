const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    default: '',
  },
  last_name: {
    type: String,
    trim: true,
    default: '',
  },
  username: {
    type: String,
    required: [true, 'A user must have a username'],
    trim: true,
    default: '',
    unique: true,
    dropDups: true,
  },
  usertype: {
    type: String,
    trim: true,
    default: 'client',
  },
  subscribtions: [
    {
      from: {
        type: String,
        trim: true,
        default: '2000-01-01',
      },
      till: {
        type: Number,
        default: 0,
      },
      station_name: {
        type: String,
        trim: true,
        default: '',
      },
      parameters: {
        type: Array,
        default: [],
      },
    },
  ],
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    trim: true,
    default: '',
  },
  passwordStr: {
    type: String,
    required: [true, 'A user must have a  str'],
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  industry_id: {
    type: String,
    trim: true,
    default: '',
  },
  integration_date: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
