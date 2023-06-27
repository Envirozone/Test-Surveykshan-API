const mongoose = require("mongoose");

const inactives = new mongoose.Schema({
  data: [],
});

const Inactives = mongoose.model("Inactives", inactives);
module.exports = Inactives;
