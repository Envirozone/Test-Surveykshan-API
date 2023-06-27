const DataValues = require("../Models/dataValuesModel");
const DataSetting = require("../Models/dataSettingModelThird");
const PCBLogs = require("../Models/pcbLogsModel");

const axios = require("axios");

const setDataTODLPCB = async function (
  industry_pb_id,
  station_pb_id,
  data,
  industry_name,
  deviceName
) {
  try {
    const res = await axios({
      method: "post",
      url: `https://dpcccems.nic.in/dlcpcb-api/api/industry/${industry_pb_id}/station/${station_pb_id}/data`,
      data,
      headers: {
        Authorization: `Basic MTgwMzIwMjBfZW1wb3dlcl9kYXRhbHl6ZXJzX3NvbHV0aW9uc18xNjQyMDM=`,
      },
    });

    if (Number(res.data.status) === 1) {
      PCBLogs.create({
        industry_name: industry_name || "",
        device_name: deviceName,
        data: JSON.stringify(data),
        board: "DLPCB",
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
        board: "DLPCB",
        status: String(res.data.status),
        send: false,
        message: res.data.msg,
        createdAt: new Date().getTime(),
      });
    }
  } catch (error) {
  }
};

exports.sendDataToDelhi = async (req, res) => {
  DataSetting.aggregate([
    {
      $unwind: "$parameters",
    },
    {
      $match: {
        "parameters.to_pcb": "DL",
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
      },
    },
  ])
    .then(async (result) => {
      const objIndustryStationId = {};
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const seprator = "____";

        const objProperty = `${element.industry_pb_id}${seprator}${element.station_pb_id}`;
        if (objIndustryStationId[objProperty]) {
          objIndustryStationId[objProperty].push(element);
        } else {
          objIndustryStationId[objProperty] = [];
          objIndustryStationId[objProperty].push(element);
        }
      }

      const objIndustryStationIdAndDatasettings = {};
      for (const [key, value] of Object.entries(objIndustryStationId)) {
        const obj = {};
        for (let i = 0; i < value.length; i++) {
          const element = value[i];
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
        objIndustryStationIdAndDatasettings[key] = obj;
      }

      for (const [key1, value1] of Object.entries(
        objIndustryStationIdAndDatasettings
      )) {
        const [industryId, stationId] = key1.split("____");

        let dataSettings = [];
        let dataValueObj = {};
        for (const [key, value] of Object.entries(value1)) {
          const [
            industryId,
            stationId,
            stationName,
            deviceName,
            instrumentId,
            functionCode,
            startingRegister,
          ] = key.split("____");

          const data = await DataValues.findOne({
            device_name: deviceName,
            instrument_id: instrumentId,
            function_code: functionCode,
            starting_register: startingRegister,
            station_name: stationName,
          })
            .sort({ _id: -1 })
            .select("created_at data_values -_id");

          if (data) {
            const currTime = new Date().getTime();
            const time = new Date(data.created_at).getTime();
            if (currTime - 1000 * 60 * 5 < time) {
              const dataValues = data?.data_values || {};
              dataValueObj = { ...dataValueObj, ...dataValues };
              dataSettings = [...dataSettings, ...value];
            }
          }
        }

        const dataArr = [];
        for (let k = 0; k < dataSettings.length; k++) {
          const element = dataSettings[k];
          const parameter_name = element.parameter_name.split("+")[0];
          const parameter_unit = element.parameter_name.split("+")[1];
          if (
            (dataValueObj[parameter_name] ||
              dataValueObj[parameter_name] === 0) &&
            dataValueObj[parameter_name] !== "n/a"
          ) {
            dataArr.push({
              deviceId: element.device_pb_id,
              params: [
                {
                  parameter: element.parameter_name
                    .split("+")[0]
                    .replaceAll("_dot_", ".")
                    .toLowerCase(),
                  value: dataValueObj[parameter_name],
                  unit: parameter_unit,
                  timestamp: new Date().getTime(),
                  flag: "U",
                },
              ],
            });
          }
        }

        setDataTODLPCB(
          industryId,
          stationId,
          dataArr,
          dataSettings[0]?.industry_name || "",
          dataSettings[0]?.device_name || ""
        );
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
