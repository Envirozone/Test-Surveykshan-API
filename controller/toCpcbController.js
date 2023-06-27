const DataValues = require("../Models/dataValuesModel");
const DataSetting = require("../Models/dataSettingModelThird");
const PCBLogs = require("../Models/pcbLogsModel");

const axios = require("axios");

const setDataTOCPCB = async function (
  industry_pb_id,
  station_pb_id,
  data,
  industry_name,
  deviceName
) {
  try {
    const res = await axios({
      method: "post",
      url: `http://rtdms.cpcb.gov.in/v1.0/industry/${industry_pb_id}/station/${station_pb_id}/data`,
      data,
      headers: {
        Authorization: `Basic MDU4OGM1Y2JjMDIwNGEzMTlmYTc1NmJmMzJmYzhhODY=`,
      },
    });
    if (Number(res.data.status) === 1) {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: JSON.stringify(data),
        board: "CPCB",
        status: String(res.data.status),
        send: true,
        message: res.data.msg,
        createdAt: new Date().getTime(),
      });
    } else {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: JSON.stringify(data),
        board: "CPCB",
        status: String(res.data.status),
        send: false,
        message: res.data.msg,
        createdAt: new Date().getTime(),
      });
    }
  } catch (error) {
    if (error?.response?.data) {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: JSON.stringify(data),
        board: "CPCB",
        status: String(error.response.data.status),
        send: false,
        message: error.response.data.msg,
        createdAt: new Date().getTime(),
      });
    }
  }
};

exports.sendDataToCpcb = async (req, res) => {
  DataSetting.aggregate([
    {
      $unwind: "$parameters",
    },
    {
      $match: {
        "parameters.to_cpcb": "true",
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
        device_pb_id: "$parameters.device_param_pb_id",
        starting_register: "$parameters.starting_register",
        function_value: "$parameters.function_value",
      },
    },
  ])
    .then(async (result) => {
      const obj = {};
      for (let i = 0; i < result.length; i++) {
        const element = result[i];

        const seprator = "____";
        const instrument = element.instrument.slice(
          element.instrument.indexOf("(") + 1,
          element.instrument.indexOf(")")
        );

        const objProperty = `${element.industry_pb_id}${seprator}${element.station_pb_id}${seprator}${element.station_name}${seprator}${element.device_name}${seprator}${instrument}${seprator}${element.function_value}${seprator}${element.starting_register}`;
        if (obj[objProperty]) {
          obj[objProperty].push(element);
        } else {
          obj[objProperty] = [];
          obj[objProperty].push(element);
        }
      }

      for (const [key, value] of Object.entries(obj)) {
        const [
          industryId,
          stationId,
          stationName,
          deviceName,
          instrumentId,
          functionCode,
          startingRegister,
        ] = key.split("____");
        try {
          const res = await DataValues.findOne({
            device_name: deviceName,
            instrument_id: instrumentId,
            function_code: functionCode,
            starting_register: startingRegister,
            station_name: stationName,
          })
            .sort({ _id: -1 })
            .select("created_at data_values -_id");

          if (res) {
            const currTime = new Date().getTime();
            const time = new Date(res.created_at).getTime();

            if (currTime - 1000 * 60 * 5 < time) {
              const dataArr = [];
              for (let k = 0; k < value.length; k++) {
                const element = value[k];
                const parameter_name = element.parameter_name.split("+")[0];
                const parameter_unit = element.parameter_name.split("+")[1];
                if (
                  (res.data_values[parameter_name] ||
                    res.data_values[parameter_name] === 0) &&
                  res.data_values[parameter_name] !== "n/a"
                ) {
                  dataArr.push({
                    deviceId: element.device_pb_id,
                    params: [
                      {
                        parameter: element.parameter_name
                          .split("+")[0]
                          .replaceAll("_dot_", ".")
                          .toLowerCase(),
                        value: res.data_values[parameter_name],
                        unit: parameter_unit,
                        timestamp: new Date().getTime(),
                        flag: "U",
                      },
                    ],
                  });
                }
              }
              setDataTOCPCB(
                industryId,
                stationId,
                dataArr,
                value[0].industry_name,
                value[0].device_name
              );
            }
          }
        } catch (error) {}
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
