const Industries = require("../Models/industriesModel");
const DataSetting = require("../Models/dataSettingModelThird");
const response = async (findData, req, res) => {
  if (findData.length === 0) {
    try {
      const industry = await Industries.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { devices: req.body } },
        {
          new: true,
          runValidators: true,
        }
      );
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
  } else if (findData.length === 1) {
    res.status(400).json({
      status: "Failed",
      message: "Device name exist!",
    });
  } else {
    res.status(400).json({
      status: "Failed",
      message: "Somthing went wrong",
    });
  }
};

exports.getAllDevicesIdAndName = async (req, res) => {
  try {
    const industriesData = await Industries.find();
    const industryDataDulpicate = industriesData;
    const demo = industryDataDulpicate.map((industry) => {
      const modDevices = industry.devices.map((device) => {
        return {
          device_id: device._id,
          device_name: device.device_name,
        };
      });
      return {
        industry_id: industry._id,
        industry_name: industry.industry_name,
        devices: modDevices,
      };
    });
    res.status(200).json({
      status: "Success",
      data: {
        industries: demo,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};

exports.getAllDevicesData = async (req, res) => {
  try {
    const industriesData = await Industries.find(req.query);
    const industryDataDulpicate = industriesData;
    const demo = [];
    industryDataDulpicate.forEach((industry) => {
      industry.devices.forEach((device) => {
        obj = {
          ...device._doc,
          device_id: device._id,
          indutry_id: industry._id,
          industry_name: industry.industry_name,
        };
        delete obj._id;
        demo.push(obj);
      });
    });
    res.status(200).json({
      status: "Success",
      data: {
        devices: demo,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};

exports.getDevicesByIndustryID = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });
    res.status(200).json({
      status: "Success",
      data: {
        devices: industryData.devices,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};

exports.getDeviceByIndustryIDAndDeviceID = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });
    const industryDataDulpicate = industryData;
    const arr = industryDataDulpicate.devices.filter((device) => {
      return String(device._id) === req.params.device_id;
    });
    if (arr.length === 1) {
      res.status(200).json({
        status: "Success",
        data: {
          device: arr[0],
        },
      });
    } else {
      res.status(404).json({
        status: "Failed",
        message: "no data",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};

exports.addNewDevice = async (req, res) => {
  const industriesData = await Industries.find();

  let findData = [];
  industriesData.forEach((industryData) => {
    industryData.devices.forEach((device) => {
      if (device.device_name === req.body.device_name) {
        findData.push(req.body.device_name);
      }
    });
  });
  response(findData, req, res);
};

exports.updateDevice = async (req, res) => {
  try {
    const {
      device_name,
      device_category,
      device_supplier,
      device_manufacturer,
      device_model_number,
    } = req.body;

    const industry = await Industries.findOneAndUpdate(
      { _id: req.params.industry_id },
      {
        $set: {
          "devices.$[el].device_name": device_name,
          "devices.$[el].device_category": device_category,
          "devices.$[el].device_supplier": device_supplier,
          "devices.$[el].device_manufacturer": device_manufacturer,
          "devices.$[el].device_model_number": device_model_number,
        },
      },
      {
        arrayFilters: [{ "el._id": req.params.device_id }],
        runValidators: true,
        returnOriginal: true,
      }
    );
    const updatedDeviceObj = industry.devices.filter(
      (device) => String(device._id) === req.params.device_id
    );

    if (updatedDeviceObj[0].device_name !== req.body.device_name) {
      try {
        const dataSettingRes = await DataSetting.updateMany(
          { device_name: updatedDeviceObj[0].device_name },
          { device_name: req.body.device_name },
          {
            new: true,
            runValidators: true,
          }
        );
        if (dataSettingRes) {
          res.status(201).json({
            status: "Updated",
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
    } else {
      res.status(201).json({
        status: "Updated",
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
};

exports.deleteDevice = async (req, res) => {
  try {
    const industryData = await Industries.findById(req.params.industry_id);
    let industryDuplicate = industryData;
    const newDevices = industryDuplicate.devices.filter((device) => {
      return String(device._id) !== req.params.device_id;
    });
    industryDuplicate.devices = newDevices;

    await Industries.findByIdAndUpdate(
      { _id: req.params.industry_id },
      industryDuplicate,
      {
        new: true,
        runValidators: true,
      }
    );

    await DataSetting.deleteMany({ device_id: req.params.device_id });

    res.status(201).json({
      status: "Deleted",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};
