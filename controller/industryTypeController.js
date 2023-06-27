const Industry_Type = require('../Models/industryTypeModel');

exports.getIndustryTypes = async (req, res) => {
  try {
    const industryTypes = await Industry_Type.find(req.query);
    res.status(200).json({
      status: 'success',
      results: industryTypes.length,
      data: {
        industry_types: industryTypes,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getIndustryType = async (req, res) => {
  try {
    const industryType = await Industry_Type.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        industry_type: industryType,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addIndustryType = async (req, res) => {
  try {
    const doc = await Industry_Type.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        industry_type: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateIndustryType = async (req, res) => {
  try {
    const industryType = await Industry_Type.findByIdAndUpdate(
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
        industry_type: industryType,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteIndustryType = async (req, res) => {
  try {
    await Industry_Type.findOneAndDelete({ _id: req.params.id });

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
