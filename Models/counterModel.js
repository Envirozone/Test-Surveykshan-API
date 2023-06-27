const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  industry_id_counter: {
    type: Number,
  },
  device_param_id_counter: {
    type: Number,
  },
  device_id_counter: {
    type: Number,
  },
});

const Counter = mongoose.model("counter", counterSchema);
module.exports = Counter;
