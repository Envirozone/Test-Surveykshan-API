const mongoose = require('mongoose');

const industryTypeSchema = new mongoose.Schema({
  type_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
});

const Industry_Type = mongoose.model('Industry_Type', industryTypeSchema);
module.exports = Industry_Type;
