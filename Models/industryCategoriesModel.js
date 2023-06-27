const mongoose = require('mongoose');

const industryCategoriesSchema = new mongoose.Schema({
  category_name: {
    type: String,
    unique: true,
    dropDups: true,
    trim: true,
  },
});

const Industry_Categories = mongoose.model(
  'Industry_Categories',
  industryCategoriesSchema
);
module.exports = Industry_Categories;
