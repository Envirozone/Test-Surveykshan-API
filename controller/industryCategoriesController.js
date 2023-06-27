const Industry_Categories = require('../Models/industryCategoriesModel');

exports.getIndustryCategories = async (req, res) => {
  try {
    const industryCategories = await Industry_Categories.find(req.query);
    res.status(200).json({
      status: 'success',
      results: industryCategories.length,
      data: {
        industry_categories: industryCategories,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getIndustryCategory = async (req, res) => {
  try {
    const industryCategory = await Industry_Categories.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        industry_category: industryCategory,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addIndustryCategory = async (req, res) => {
  try {
    const doc = await Industry_Categories.create(req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: 'success',
      data: {
        industry_category: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateIndustryCategory = async (req, res) => {
  try {
    const industryCategory = await Industry_Categories.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(204).json({
      status: 'success',
      data: {
        industry_category: industryCategory,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteIndustryCategory = async (req, res) => {
  try {
    await Industry_Categories.findOneAndDelete({ _id: req.params.id });

    res.status(204).json({
      status: 'successfully deleted',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
