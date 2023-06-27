const PCBLogs = require("../Models/pcbLogsModel");

exports.getAllPCBLogs = async (req, res) => {
  try {
    const { searchStr, numberOfLogs, pageNumber, board } = req.query;

    const page = pageNumber * 1 || 1;
    const limit = numberOfLogs * 1 || 100;
    const skip = limit * (page - 1);

    const logs = await PCBLogs.find({
      board,
      $or: [
        { industry_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { device_name: { $regex: new RegExp(searchStr), $options: "i" } },
      ],
    })
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    const count = await PCBLogs.find({
      board,
      $or: [
        { industry_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { device_name: { $regex: new RegExp(searchStr), $options: "i" } },
      ],
    }).countDocuments();

    res.status(200).json({
      status: "success",
      count,
      data: {
        logs,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getAllPCBLogsByDevice = async (req, res) => {
  try {
    if (req.query.searchStr.length > 0) {
      const { searchStr, numberOfLogs, pageNumber, board } = req.query;

      const page = pageNumber * 1 || 1;
      const limit = numberOfLogs * 1 || 100;
      const skip = limit * (page - 1);

      const logs = await PCBLogs.find({
        device_name: searchStr,
        board,
      })
        .limit(limit)
        .skip(skip)
        .sort({ _id: -1 });

      const count = await PCBLogs.find({
        device_name: searchStr,
        board,
      }).countDocuments();

      res.status(200).json({
        status: "success",
        count,
        data: {
          logs,
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        count: 0,
        data: {
          logs: [],
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getLastSuccessPCBLogByDeviceName = async (req, res) => {
  try {
    const { device_name, board } = req.query;

    const queryObj =
      board === "CPCB"
        ? {
            device_name: { $in: device_name.split(" ") },
            board,
            send: true,
          }
        : {
            device_name: { $in: device_name.split(" ") },
            board: { $ne: "CPCB" },
            send: true,
          };

    const log = await PCBLogs.findOne(queryObj)
      .sort({ _id: -1 })
      .select("createdAt -_id");

    res.status(200).json({
      status: "success",
      log,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};
