const Alerts = require("../Models/alertsModel");
const Industries = require("../Models/industriesModel");

exports.getAllAlerts = async (req, res) => {
  try {
    const { searchStr, numberOfAlerts, pageNumber, alert_type } = req.query;
    const page = pageNumber * 1 || 1;
    const limit = numberOfAlerts * 1 || 100;
    const skip = limit * (page - 1);

    const otherQuery = { alert_type };

    if (req.query?.state) {
      const industryName = await Industries.find({
        state: req.query.state,
      }).select("industry_name -_id");
      const names = industryName.map(({ industry_name }) => industry_name);
      otherQuery.industry_name = { $in: names };
    }

    if (req.query?.industry_id) {
      try {
        const industryName = await Industries.findOne({
          _id: req.query.industry_id,
        }).select("industry_name -_id");
        otherQuery.industry_name = industryName.industry_name;
      } catch (error) {}
    }

    if (req.query?.industry_partner) {
      try {
        const industryName = await Industries.find({
          industry_partner: req.query.industry_partner,
        }).select("industry_name -_id");
        const names = industryName.map(({ industry_name }) => industry_name);
        otherQuery.industry_name = { $in: names };
      } catch (error) {}
    }

    const alerts = await Alerts.find({
      ...otherQuery,
      $or: [
        { industry_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { device_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { alert_type: { $regex: new RegExp(searchStr), $options: "i" } },
      ],
    })
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    const count = await Alerts.find({
      ...otherQuery,
      $or: [
        { industry_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { device_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { alert_type: { $regex: new RegExp(searchStr), $options: "i" } },
      ],
    }).countDocuments();

    res.status(200).json({
      status: "Success",
      count,
      alerts,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};
