const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  partner_name: {
    type: String,
    unique: true,
    // dropDups: true,
    trim: true,
  }
});

const Partner = mongoose.model('partner', partnerSchema);
module.exports = Partner;
