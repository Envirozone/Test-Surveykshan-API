const Industries = require('../Models/industriesModel');

exports.getAllIndustriesName = async (req, res) => {
  try {
    let industryNames = [];
    const allIndustries = await Industries.find();
    allIndustries.forEach((industry) => {
      let newIndustry = {};
      newIndustry.industry_name = industry.industry_name;
      newIndustry._id = industry._id;
      industryNames.push(newIndustry);
      newIndustry = {};
    });

    res.status(200).json({
      status: 'success',
      results: industryNames.length,
      data: {
        industry_names: industryNames,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
