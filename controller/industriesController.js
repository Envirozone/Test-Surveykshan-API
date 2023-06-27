const Industries = require("../Models/industriesModel");
const Counter = require("../Models/counterModel");
const DataSetting = require("../Models/dataSettingModelThird");

exports.getAllIndustries = async (req, res) => {
  try {
    const allIndustries = await Industries.find(req.query);
    res.status(200).json({
      status: "success",
      results: allIndustries.length,
      data: {
        industries: allIndustries,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getIndustry = async (req, res) => {
  try {
    const industry = await Industries.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        industry,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.addNewIndustry = async (req, res) => {
  try {
    const { industry_id_counter } = await Counter.findByIdAndUpdate(
      { _id: "648ab9bd18732e2028b40024" },
      {
        $inc: { industry_id_counter: 1 },
      },
      { returnOriginal: false }
    ).select("-_id industry_id_counter");

    const doc = await Industries.create({
      ...req.body,
      industry_pb_id: `SKID_N${industry_id_counter}`,
    });

    res.status(201).json({
      status: "success",
      data: {
        industry: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.updateIndustry = async (req, res) => {
  try {
    const industry = await Industries.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        returnOriginal: true,
        runValidators: true,
      }
    );

    if (industry.industry_name !== req.body.industry_name) {
      try {
        const dataSettingRes = await DataSetting.findOneAndUpdate(
          { industry_id: req.params.id },
          { industry_name: req.body.industry_name },
          {
            new: true,
            runValidators: true,
          }
        );
        if (dataSettingRes) {
          res.status(201).json({
            status: "success",
            data: {
              industry,
            },
          });
        }
      } catch (error) {
        res.status(400).json({
          status: "Failed",
          message: error.message,
        });
      }
    }

    res.status(201).json({
      status: "success",
      data: {
        industry,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.deleteIndustry = async (req, res) => {
  try {
    await Industries.findOneAndDelete({ _id: req.params.id });
    await DataSetting.deleteMany({ industry_id: req.params.id });

    res.status(204).json({
      status: "successfully deleted",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};
