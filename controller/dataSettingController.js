const DataSetting = require("../Models/dataSettingModelThird");
const Industries = require("../Models/industriesModel");
const Counter = require("../Models/counterModel");

exports.getAllDataSettings = async (req, res) => {
  try {
    const { searchStr, numberOfDataSettings } = req.query;
    const dataSettingData = await DataSetting.find({
      $or: [
        { device_name: { $regex: new RegExp(searchStr), $options: "i" } },
        { industry_name: { $regex: new RegExp(searchStr), $options: "i" } },
        // {
        //   'parameters.station_name': {
        //     $regex: new RegExp(searchStr),
        //     $options: 'i',
        //   },
        // },
        // {
        //   'parameters.industry_pb_id': {
        //     $regex: new RegExp(searchStr),
        //     $options: 'i',
        //   },
        // },
      ],
    }).limit(numberOfDataSettings * 1);

    const dataSettingDataDulpicate = dataSettingData;
    const demo = [];
    dataSettingDataDulpicate.forEach((dataSetting) => {
      dataSetting.parameters.forEach((parameter) => {
        obj = {
          ...parameter._doc,
          parameter_id: parameter._id,
          dataSetting_id: dataSetting._id,
          dataSetting_device_name: dataSetting.device_name,
          dataSetting_industry_name: dataSetting.industry_name,
        };
        delete obj._id;
        demo.push(obj);
      });
    });
    res.status(200).json({
      status: "Success",
      data: {
        dataSettings: demo,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};

exports.addNewDatasetting = async (req, res) => {
  try {
    const {
      device_param_id_counter,
      device_id_counter,
    } = await Counter.findByIdAndUpdate(
      { _id: "648ab9bd18732e2028b40024" },
      {
        $inc: { device_param_id_counter: 1, device_id_counter: 1 },
      },
      { returnOriginal: false }
    ).select("-_id device_param_id_counter device_id_counter");

    const { industry_pb_id } = await Industries.findOne({
      industry_name: req.body.industry_name,
      _id: req.body.industry_id,
    }).select("-_id industry_pb_id");

    if (industry_pb_id && device_param_id_counter && device_id_counter) {
      const data =
        (await DataSetting.findOne({ device_name: req.body.device_name })) ||
        null;

      if (!data) {
        const dataSettingDevice = await DataSetting.create({
          industry_name: req.body.industry_name,
          industry_id: req.body.industry_id,
          device_name: req.body.device_name,
          device_id: req.body.device_id,
        });

        const {
          industry_name,
          industry_id,
          device_name,
          device_id,
          ...parameterData
        } = req.body;

        const dataSetting = await DataSetting.findByIdAndUpdate(
          { _id: dataSettingDevice._id },
          {
            $push: {
              parameters: {
                ...parameterData,
                industry_pb_id,
                device_pb_id:`SK_N${device_id_counter}`,
                device_param_pb_id:`SKPID_N${device_param_id_counter}`,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        res.status(201).json({
          status: "success",
          dataSetting,
        });
      } else {
        let checkParameter = [];
        if (data.parameters.length > 0) {
          checkParameter = data.parameters.filter(
            (item) =>
              item.parameter_name === req.body.parameter_name &&
              item.station_pb_id === req.body.station_pb_id
          );
        }
        if (checkParameter.length === 0) {
          try {
            const dataSetting = await DataSetting.findByIdAndUpdate(
              { _id: data._id },
              {
                $push: {
                  parameters: { ...req.body, industry_pb_id,
                device_pb_id:`SK_N${device_id_counter}`,
                device_param_pb_id:`SKPID_N${device_param_id_counter}` },
                },
              },
              {
                new: true,
                runValidators: true,
              }
            );

            res.status(201).json({
              status: "Failed",
              dataSetting,
            });
          } catch (error) {
            res.status(404).json({
              status: "Failed",
              message: "Something went wrong",
            });
          }
        } else {
          res.status(404).json({
            status: "Failed",
            message: "Data setting already exist!",
          });
        }
      }
    } else {
      throw new Error("Something went wrong");
    }
    /* 
    
    */
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "Failed",
      message: "Something went wrong",
    });
  }
};

exports.updateDataSetting = async (req, res) => {
  try {
    const dataSetting = await DataSetting.findById({
      _id: req.params.dataSetting_id,
    });

    let dataSettingDulpicate = dataSetting;
    let demo = [];
    dataSettingDulpicate.parameters.forEach((parameter) => {
      if (String(parameter._id) === req.params.parameter_id) {
        demo.push({ ...parameter._doc, ...req.body });
      } else {
        demo.push({ ...parameter._doc });
      }
    });
    dataSettingDulpicate.parameters = demo;
    const dataSettingUpdated = await DataSetting.findByIdAndUpdate(
      { _id: req.params.dataSetting_id },
      dataSettingDulpicate,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(201).json({
      status: "Updated",
      data: {
        dataSetting: dataSettingUpdated,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.updateParametersByDeviceName = async (req, res) => {
  try {
    const up = await DataSetting.findOneAndUpdate(
      { device_name: req.params.device_name },
      {
        parameters: req.body,
      }
    );

    res.status(201).json({
      status: "Updated",
      doc: up,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.deleteDataSetting = async (req, res) => {
  try {
    const dataSettingData = await DataSetting.findById(
      req.params.dataSetting_id
    );
    let dataSettingDataDuplicate = dataSettingData;
    const newParameters = dataSettingDataDuplicate.parameters.filter(
      (parameter) => {
        return String(parameter._id) !== req.params.parameter_id;
      }
    );
    dataSettingDataDuplicate.parameters = newParameters;

    const dataSetting = await DataSetting.findByIdAndUpdate(
      { _id: req.params.dataSetting_id },
      dataSettingDataDuplicate,
      {
        new: true,
        runValidators: true,
      }
    );
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

exports.getParametersByDevice = async (req, res) => {
  try {
    const dataSettingData = await DataSetting.find({
      device_name: req.params.device_name,
    });
    const parametersArr = dataSettingData[0].parameters.map(
      (parameter) => parameter.parameter_name.split("+")[0]
    );

    res.status(201).json({
      status: "success",
      parameters: parametersArr,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getDataSettingByDeviceAndParameter = async (req, res) => {
  try {
    const dataSettingData = await DataSetting.findById({
      _id: req.params.dataSetting_id,
    });
    const dataSettingDataDulpicate = dataSettingData;
    const arr = dataSettingDataDulpicate.parameters.filter((parameter) => {
      return String(parameter._id) === req.params.parameter_id;
    });
    if (arr.length === 1) {
      res.status(200).json({
        status: "Success",
        data: {
          parameter: {
            industry_name: dataSettingDataDulpicate.industry_name || "",
            device_name: dataSettingDataDulpicate.device_name || "",
            ...arr[0]._doc,
          },
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

exports.getDataSettingsFromDeviceName = async (req, res) => {
  try {
    const dataSettingData = await DataSetting.find({
      device_name: req.params.device_name,
    });

    res.status(200).json({
      status: "Success",
      data: {
        dataSettings: dataSettingData,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Success",
      message: error.message,
    });
  }
};
