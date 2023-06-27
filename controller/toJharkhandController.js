const DataValues = require("../Models/dataValuesModel");
const DataSetting = require("../Models/dataSettingModelThird");
const PCBLogs = require("../Models/pcbLogsModel");

const axios = require("axios");
const format = require("date-format");

const setDataTOJharkhand = async function (config, industry_name, deviceName) {
  const {
    venderId,
    industryId,
    stationId,
    analyserId,
    parameterName,
    unit,
    val,
    timeStamp,
  } = config;

  const url = `http://jsac.jharkhand.gov.in/Pollution/WebService.asmx/GET_PM_DATA?vender_id=${venderId}&industry_id=${industryId}&stationId=${stationId}&analyserId=${analyserId}&processValue=${val}&scaledValue=${val}&flag=U&timestamp=${timeStamp}&unit=${parameterName}&parameter=${unit}`;

  try {
    const res = await axios({
      method: "GET",
      url,
    });
    if (
      res.status === 200 &&
      res.statusText === "OK" &&
      res.data.includes(">1<")
    ) {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: url,
        board: "JHPCB",
        status: String(res.status),
        send: true,
        message: res.data,
        createdAt: new Date().getTime(),
      });
    } else {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: url,
        board: "JHPCB",
        status: String(res.status),
        send: false,
        message: res.data,
        createdAt: new Date().getTime(),
      });
    }
  } catch (error) {}
};

exports.sendDataToJharkhand = async (req, res) => {
  DataSetting.aggregate([
    {
      $unwind: "$parameters",
    },
    {
      $match: {
        "parameters.to_pcb": "JH",
      },
    },
    {
      $project: {
        device_name: "$device_name",
        industry_name: "$industry_name",
        instrument: "$parameters.instrument",
        parameter_name: "$parameters.parameter_name",
        parameter_custom_name: "$parameters.parameter_custom_name",
        industry_pb_id: "$parameters.industry_pb_id",
        station_pb_id: "$parameters.station_pb_id",
        station_name: "$parameters.station_name",
        device_pb_id: "$parameters.device_pb_id",
        starting_register: "$parameters.starting_register",
        function_value: "$parameters.function_value",
        analyzer_id: "$parameters.analyzer_id",
      },
    },
  ])
    .then(async (result) => {
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const instrument = element.instrument.slice(
          element.instrument.indexOf("(") + 1,
          element.instrument.indexOf(")")
        );

        const res = await DataValues.findOne({
          device_name: element.device_name,
          instrument_id: instrument,
          function_code: element.function_value,
          starting_register: element.starting_register,
          station_name: element.station_name,
        })
          .sort({ _id: -1 })
          .select("created_at data_values -_id");

        if (res) {
          const currTime = new Date().getTime();
          const time = new Date(res.created_at).getTime();

          if (currTime - 1000 * 60 * 5 < time) {
            const parameterNameWithDot = element.parameter_name
              .split("+")[0]
              .replaceAll(".", "_dot_");
            if (
              (res.data_values[parameterNameWithDot] ||
                res.data_values[parameterNameWithDot] === 0) &&
              res.data_values[parameterNameWithDot] !== "n/a"
            ) {
              setDataTOJharkhand(
                {
                  venderId: 21,
                  industryId: element.industry_pb_id,
                  stationId: element.station_pb_id,
                  analyserId: element.analyzer_id,
                  parameterName: element.parameter_name
                    .split("+")[0]
                    .replaceAll("_dot_", ".")
                    .toLowerCase(),
                  unit: element.parameter_name.split("+")[1],
                  val: res.data_values[parameterNameWithDot],
                  timeStamp: format("yyyy-MM-dd hh:mm:ss", new Date()),
                },
                element.industry_name,
                element.device_name
              );
            }
          }
        }
      }
      res.status(200).json({
        status: "Success",
      });
    })
    .catch((error) => {
      res.status(200).json({
        status: "Failed",
        message: error.message,
      });
    });
};
