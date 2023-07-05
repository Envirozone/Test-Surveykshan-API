const RawData = require("../Models/rawData");
const DataSetting = require("../Models/dataSettingModelThird");
const Industries = require("../Models/industriesModel");
const DataValues = require("../Models/dataValuesModel");
const Alert = require("../Models/alertsModel");
const moment = require("moment-timezone");
const format = require("date-format");
const { default: axios } = require("axios");
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");
// `\\b${replaceThis}\\b`
exports.getAllRawData = async (req, res) => {
  try {
    const doc = await RawData.find()
      .sort({ _id: -1 })
      .limit(req.params.arr_length * 1);

    res.status(200).json({
      status: "success",
      data: {
        raw_data: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.getAllRawDataByDeviceName = async (req, res) => {
  try {
    const { searchStr } = req.query;
    const doc = await RawData.find({ device_name: searchStr })
      .sort({ _id: -1 })
      .limit(req.params.arr_length * 1)
      .exec();

    res.status(200).json({
      status: "success",
      data: {
        raw_data: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getDeviceName = (str) => {
  if (str.indexOf("#") >= 0 && str.indexOf("$") >= 0) {
    const f = str.indexOf("$");
    const l = str.indexOf("#");
    const strOnly = str.slice(f + 1, l);
    const deviceName = strOnly.slice(0, strOnly.indexOf(","));
    return deviceName[0] === "M" ? deviceName : false;
  } else {
    return false;
  }
};

const extractInstrumentIdFromName = (insName) => {
  return insName.slice(insName.indexOf("(") + 1, insName.indexOf(")"));
};

const extractDataFromStr = (str) => {
  let result = {};
  const splitStr = str
    .slice(str.indexOf("$") + 1, str.indexOf(",Z"))
    .split("+")
    .join(",")
    .split(" ,Z")
    .join(",Z")
    .split(" ")
    .join(",")
    .split(",");

  const splitStrIncZ = str
    .slice(str.indexOf("$") + 1, str.indexOf("#"))
    .split("+")
    .join(",")
    .split(" ,Z")
    .join(",Z")
    .split(" ")
    .join(",")
    .split(",");

  result.deviceName = splitStr[0];
  result.instrumentId = splitStr[1];
  result.functionCode = splitStr[2];
  result.startingRegister = splitStr[4];
  result.regLength = `${splitStr[5]}-${splitStr[6]}`;
  result.date = splitStr[7];
  result.time = splitStr[8];
  result.data = splitStr.splice(9, splitStr.length);
  result.dataIncZ = splitStrIncZ.splice(9, splitStrIncZ.length);
  return result;
};

const extractDataFromNMStr = (str) => {
  let result = {};
  const splitStr = str
    .slice(str.indexOf("$") + 1, str.indexOf("#"))
    .split("---")
    .join(",")
    .split(" ")
    .join(",")
    .split(",");
  const data = str
    .slice(str.indexOf("+") + 1, str.indexOf("Z") - 1)
    .split("")
    .map((item) => {
      if (item != " ") return item;
    })
    .join("")
    .split("+")
    .join(",")
    .split("-")
    .join(",")
    .split(",");
  const data420 = str.slice(str.indexOf("Z") + 1, str.indexOf("#")).split(",");
  result.deviceName = splitStr[0];
  result.instrumentId = splitStr[1];
  result.startingRegister = splitStr[2];
  result.date = splitStr[3];
  result.time = splitStr[4];
  result.data = data;
  result.data420 = data420;
  return result;
};

const arrangeInOrder = (data, order) => {
  let result = [];
  for (i = 0; i < data.length; i++) {
    result[order[i] - 1] = data[i];
  }
  return result;
};

const hexToFloatConversion = (str) => {
  var float = 0,
    sign,
    order,
    mantiss,
    exp,
    int = 0,
    multi = 1;
  if (/^0x/.exec(str)) {
    int = parseInt(str, 16);
  } else {
    for (var i = str.length - 1; i >= 0; i -= 1) {
      if (str.charCodeAt(i) > 255) {
        return false;
      }
      int += str.charCodeAt(i) * multi;
      multi *= 256;
    }
  }
  sign = int >>> 31 ? -1 : 1;
  exp = ((int >>> 23) & 0xff) - 127;
  mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
  for (i = 0; i < mantissa.length; i += 1) {
    float += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0;
    exp--;
  }
  return float * sign;
};

const checkAllNA = (values) => {
  const arr = Object.values(values);
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (val !== "n/a") return false;
  }
  return true;
};

const checkIsDataInArr = (arr) => {
  if (arr.length === 0) {
    return false;
  } else {
    for (let i = 0; i < arr.length; i++) {
      const ele = arr[i];
      if (
        ele !== "" &&
        ele !== " " &&
        ele !== "," &&
        ele !== " ," &&
        ele !== ", "
      )
        return true;
    }
  }
  return false;
};

const sendMessage = (
  message,
  phone,
  alert_type,
  industry_name,
  device_name,
  station_name,
  parameter_name
) => {
  // const accountSid = 'AC270dcbb3db89e204580359b0f1c04a0f';
  // const authToken = '6bcdd27587f56bb59b4e1fc96e39c18b';

  // const client = require('twilio')(accountSid, authToken);
  // client.messages
  //   .create({
  //     body: message,
  //     from: '+19106065003',
  //     to: '+919582824760' || `+91${phone}`,
  //   })
  //   .then((message) => {
  const currTime = new Date().getTime();

  if (
    localStorage.getItem(
      `${device_name}_${station_name}_${parameter_name}_${alert_type}`
    )
  ) {
    if (
      localStorage.getItem(
        `${device_name}_${station_name}_${parameter_name}_${alert_type}`
      ) <
      currTime - 1000 * 60 * 15
    ) {
      localStorage.setItem(
        `${device_name}_${station_name}_${parameter_name}_${alert_type}`,
        currTime
      );

      Alert.create({
        industry_name,
        device_name,
        station_name,
        parameter_name,
        alert_type,
        body: message,
        createdAt: currTime,
      }).catch((error) => {
        console.log(error.message);
      });
    }
  } else {
    localStorage.setItem(
      `${device_name}_${station_name}_${parameter_name}_${alert_type}`,
      currTime
    );

    Alert.create({
      industry_name,
      device_name,
      station_name,
      parameter_name,
      alert_type,
      body: message,
      createdAt: currTime,
    }).catch((error) => {
      console.log(error.message);
    });
  }

  // })
  // .catch((error) => {
  //   console.log(error.message);
  // });
};

const sendMessageToIndustry = ({
  max_std_value,
  min_std_value,
  deviceName,
  station_name,
  parameter_name,
  value,
  dateTime,
}) => {
  if (Number(max_std_value) < value && typeof value === "number") {
    Industries.findOne({
      "devices.device_name": deviceName,
    })
      .select("industry_name location_name phone_number -_id")
      .then((res) => {
        sendMessage(
          `SMS ALERT FROM SURVEYKSHAN Industry : ${res.industry_name}, Location : ${res.location_name}, Station Name : ${station_name} Exceeding Parameter : ${parameter_name}, Value : ${value}, Date & Time : ${dateTime} Avg Value for last 15 Min Respond at info@e2i.co.in Team - Envirozone Equipments & Instruments`,
          res.phone_number.split(",")[0],
          "exceed",
          res.industry_name,
          deviceName,
          station_name,
          parameter_name
        );
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else if (Number(min_std_value) > value && typeof value === "number") {
    Industries.findOne({
      "devices.device_name": deviceName,
    })
      .select("industry_name location_name phone_number -_id")
      .then((res) => {
        sendMessage(
          `SMS ALERT FROM SURVEYKSHAN Industry : ${res.industry_name}, Location : ${res.location_name}, Station Name : ${station_name} Deceeding Parameter : ${parameter_name}, Value : ${value}, Date & Time : ${dateTime} Avg Value for last 15 Min Respond at info@e2i.co.in Team - Envirozone Equipments & Instruments`,
          res.phone_number.split(",")[0],
          "deceed",
          res.industry_name,
          deviceName,
          station_name,
          parameter_name
        );
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
};

exports.insertRawDataString = async (req, res) => {
  try {
    const dataCur = moment.tz(Date.now(), "Asia/Kolkata").format();
    const deviceName = getDeviceName(req.body.data);
    const strData = extractDataFromStr(req.body.data);

    let instrumentID = strData.instrumentId;
    let functionCode = strData.functionCode;
    let startingRegister = strData.startingRegister;
    const registerBytes = strData.regLength.split("-")[1] * 1;

    let isErrorString = false;
    if (instrumentID === "NM") {
      startingRegister = "NM";
    } else {
      const strFilterDataLength = strData.data.filter((item) => {
        if (item !== "" && item !== " ") {
          return item;
        }
      }).length;

      strFilterDataLength === 0
        ? (isErrorString = false)
        : strFilterDataLength === registerBytes
        ? (isErrorString = false)
        : (isErrorString = true);
    }

    if (deviceName && !isErrorString) {
      // Update last data recived in industries.device object
      // start
      try {
        await Industries.findOneAndUpdate(
          { "devices.device_name": deviceName },
          {
            "devices.$[].last_data_recived": moment
              .tz(Date.now(), "Asia/Kolkata")
              .format(),
          }
        );
      } catch (error) {
        console.log(error.message);
      }
      // end
      const doc = await RawData.create({
        data_string: req.body.data,
        device_name: deviceName,
        instrument_id: instrumentID,
        function_code: functionCode,
        starting_register: startingRegister,
        created_at: dataCur,
        created_date: `${dataCur.split("T")[0]}`,
      });

      const dataSetting = await DataSetting.find({
        device_name: deviceName,
      }).exec();

      if (dataSetting.length > 0) {
        const values = {};

        for (let k = 0; k < dataSetting[0].parameters.length; k++) {
          const parameter = dataSetting[0].parameters[k];

          let {
            instrument,
            parameter_name,
            station_name,
            sequence_number,
            Number_of_bytes,
            holding_register_number,
            starting_register,
            function_value,
            min_std_value,
            max_std_value,
            multiplication_factor,
            conversion_type,
            constant_value_420,
            range_420,
            constant_subtraction_420,
            byte_reading_order,
            min_vaild_value,
            max_valid_value,
          } = parameter;

          const instrumentId = extractInstrumentIdFromName(instrument);

          if (parameter_name.includes(".")) {
            parameter_name = parameter_name.replaceAll(".", "_dot_");
          }

          if (instrumentID === "NM" && function_value === functionCode) {
            const strDataNM = extractDataFromNMStr(req.body.data);
            if (checkIsDataInArr(strDataNM.data)) {
              if (
                parameter_name
                  .split("+")
                  .join("_")
                  .split("_")
                  .includes("totalizer")
              ) {
                let allData = await RawData.find({
                  device_name: deviceName,
                  instrument_id: instrumentID,
                  function_code: functionCode,
                  starting_register: startingRegister,
                  created_date: `${dataCur.split("T")[0]}`,
                })
                  .sort({ _id: 1 })
                  .limit(1);
                const data = allData[0];
                const strDataNMF = extractDataFromNMStr(data.data_string);

                const firstValue = parseFloat(
                  Number(strDataNMF.data[sequence_number * 1 - 1])
                );

                const lastValue = parseFloat(
                  Number(strDataNM.data[sequence_number * 1 - 1])
                );

                const val =
                  parseFloat(
                    (lastValue - firstValue) * Number(multiplication_factor)
                  ) ?? "n/a";

                if (
                  (min_vaild_value * 1 <= val && val <= max_valid_value * 1) ||
                  val === "n/a"
                ) {
                  values[parameter_name.split("+")[0] + "+" + station_name] =
                    val.toFixed(2) * 1;
                  sendMessageToIndustry({
                    max_std_value,
                    min_std_value,
                    deviceName,
                    station_name,
                    parameter_name: parameter_name
                      .split("+")[0]
                      .replaceAll("_dot_", "."),
                    value: val.toFixed(2) * 1,
                    dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                  });
                } else {
                  values[parameter_name.split("+")[0] + "+" + station_name] =
                    "n/a";
                }
              } else {
                const val =
                  parseFloat(
                    Number(strDataNM.data[sequence_number * 1 - 1]) *
                      Number(multiplication_factor)
                  ) ?? "n/a";

                if (
                  (min_vaild_value * 1 <= val && val <= max_valid_value * 1) ||
                  val === "n/a"
                ) {
                  values[parameter_name.split("+")[0] + "+" + station_name] =
                    val.toFixed(2) * 1;
                  sendMessageToIndustry({
                    max_std_value,
                    min_std_value,
                    deviceName,
                    station_name,
                    parameter_name: parameter_name
                      .split("+")[0]
                      .replaceAll("_dot_", "."),
                    value: val.toFixed(2) * 1,
                    dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                  });
                } else {
                  values[parameter_name.split("+")[0] + "+" + station_name] =
                    "n/a";
                }
              }
            } else {
              values[parameter_name.split("+")[0] + "+" + station_name] = "n/a";
            }
          } else if (
            instrumentId === instrumentID &&
            function_value === functionCode &&
            starting_register === startingRegister
          ) {
            switch (conversion_type) {
              case "no-change":
                if (Number(Number_of_bytes) === 1) {
                  const strDataNM = extractDataFromNMStr(req.body.data);
                  if (checkIsDataInArr(strDataNM.data)) {
                    const val =
                      parseFloat(
                        Number(strDataNM.data[sequence_number * 1 - 1]) *
                          Number(multiplication_factor)
                      ) ?? "n/a";

                    if (
                      (min_vaild_value * 1 <= val &&
                        val <= max_valid_value * 1) ||
                      val === "n/a"
                    ) {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = val.toFixed(2) * 1;

                      sendMessageToIndustry({
                        max_std_value,
                        min_std_value,
                        deviceName,
                        station_name,
                        parameter_name: parameter_name
                          .split("+")[0]
                          .replaceAll("_dot_", "."),
                        value: val.toFixed(2) * 1,
                        dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      });
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  } else {
                    values[parameter_name.split("+")[0] + "+" + station_name] =
                      "n/a";
                  }
                }
                break;
              case "Decimal":
                if (Number(Number_of_bytes) === 2) {
                  const data = strData.data.slice(
                    Number(sequence_number) - 1,
                    Number(sequence_number) - 1 + Number(Number_of_bytes)
                  );
                  if (checkIsDataInArr(data)) {
                    const order = byte_reading_order
                      .split(",")
                      .map((item) => Number(item));

                    const oprationalData = arrangeInOrder(data, order);

                    const val =
                      parseFloat(
                        (Number(oprationalData[0]) * 256 +
                          Number(oprationalData[1])) *
                          Number(multiplication_factor)
                      ) ?? "n/a";

                    if (
                      (min_vaild_value * 1 <= val &&
                        val <= max_valid_value * 1) ||
                      val === "n/a"
                    ) {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = val.toFixed(2) * 1;

                      sendMessageToIndustry({
                        max_std_value,
                        min_std_value,
                        deviceName,
                        station_name,
                        parameter_name: parameter_name
                          .split("+")[0]
                          .replaceAll("_dot_", "."),
                        value: val.toFixed(2) * 1,
                        dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      });
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  } else {
                    values[parameter_name.split("+")[0] + "+" + station_name] =
                      "n/a";
                  }
                  break;
                } else if (Number(Number_of_bytes) === 4) {
                  if (
                    parameter_name
                      .split("+")
                      .join("_")
                      .split("_")
                      .includes("totalizer")
                  ) {
                    let allData = await RawData.find({
                      device_name: deviceName,
                      instrument_id: instrumentID,
                      function_code: functionCode,
                      starting_register: startingRegister,
                      created_date: `${dataCur.split("T")[0]}`,
                    })
                      .sort({ _id: 1 })
                      .limit(1);
                    const data = allData[0];

                    const strDataL = extractDataFromStr(req.body.data);
                    const oprationalDataL = strDataL.data.slice(
                      Number(sequence_number) - 1,
                      Number(sequence_number) - 1 + Number(Number_of_bytes)
                    );

                    if (checkIsDataInArr(oprationalDataL)) {
                      const order = byte_reading_order
                        .split(",")
                        .map((item) => Number(item));

                      const oprationalHexLastValueL = arrangeInOrder(
                        oprationalDataL,
                        order
                      )
                        .map((item) => (item * 1).toString(16))
                        .reduce((total, str) => {
                          if (str.length === 1) {
                            return total + ("0" + str);
                          } else {
                            return total + str;
                          }
                        }, "");

                      const lastValue = parseInt(oprationalHexLastValueL, 16);

                      const { data_string } = data;

                      const strDataF = extractDataFromStr(data_string);

                      const oprationalDataF = strDataF.data.slice(
                        Number(sequence_number) - 1,
                        Number(sequence_number) - 1 + Number(Number_of_bytes)
                      );

                      const oprationalFirstHexValue = arrangeInOrder(
                        oprationalDataF,
                        order
                      )
                        .map((item) => (item * 1).toString(16))
                        .reduce((total, str) => {
                          if (str.length === 1) {
                            return total + ("0" + str);
                          } else {
                            return total + str;
                          }
                        }, "");

                      const firstValue =
                        parseInt(oprationalFirstHexValue, 16) || lastValue;

                      const val =
                        parseFloat(
                          (lastValue - firstValue) *
                            Number(multiplication_factor)
                        ) ?? "n/a";

                      if (
                        (min_vaild_value * 1 <= val &&
                          val <= max_valid_value * 1) ||
                        val === "n/a"
                      ) {
                        values[
                          parameter_name.split("+")[0] + "+" + station_name
                        ] = val.toFixed(2) * 1;

                        sendMessageToIndustry({
                          max_std_value,
                          min_std_value,
                          deviceName,
                          station_name,
                          parameter_name: parameter_name
                            .split("+")[0]
                            .replaceAll("_dot_", "."),
                          value: val.toFixed(2) * 1,
                          dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                        });
                      } else {
                        values[
                          parameter_name.split("+")[0] + "+" + station_name
                        ] = "n/a";
                      }
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  } else {
                    const dataStr = strData.data.slice(
                      Number(sequence_number) - 1,
                      Number(sequence_number) - 1 + Number(Number_of_bytes)
                    );
                    if (checkIsDataInArr(dataStr)) {
                      const order = byte_reading_order
                        .split(",")
                        .map((item) => Number(item));
                      const oprationalHexLastValue = arrangeInOrder(
                        dataStr,
                        order
                      )
                        .map((item) => (item * 1).toString(16))
                        .reduce((total, str) => {
                          if (str.length === 1) {
                            return total + ("0" + str);
                          } else {
                            return total + str;
                          }
                        }, "");
                      const val =
                        Number(parseInt(oprationalHexLastValue, 16)) *
                          Number(multiplication_factor) ?? "n/a";

                      if (
                        (min_vaild_value * 1 <= val &&
                          val <= max_valid_value * 1) ||
                        val === "n/a"
                      ) {
                        values[
                          parameter_name.split("+")[0] + "+" + station_name
                        ] = val.toFixed(2) * 1;

                        sendMessageToIndustry({
                          max_std_value,
                          min_std_value,
                          deviceName,
                          station_name,
                          parameter_name: parameter_name
                            .split("+")[0]
                            .replaceAll("_dot_", "."),
                          value: val.toFixed(2) * 1,
                          dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                        });
                      } else {
                        values[
                          parameter_name.split("+")[0] + "+" + station_name
                        ] = "n/a";
                      }
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  }
                  break;
                }
                break;
              case "Float":
                if (Number(Number_of_bytes) === 4) {
                  const dataStr = strData.data.slice(
                    Number(sequence_number) - 1,
                    Number(sequence_number) - 1 + Number(Number_of_bytes)
                  );
                  if (checkIsDataInArr(dataStr)) {
                    const order = byte_reading_order
                      .split(",")
                      .map((item) => Number(item));
                    const oprationalHexLastValue = arrangeInOrder(
                      dataStr,
                      order
                    )
                      .map((item) => (item * 1).toString(16))
                      .reduce((total, str) => {
                        if (str.length === 1) {
                          return total + ("0" + str);
                        } else {
                          return total + str;
                        }
                      }, "");
                    const floatValue = hexToFloatConversion(
                      `0x${oprationalHexLastValue}`
                    );

                    const val =
                      Number(parseFloat(floatValue) ?? "n/a") *
                        Number(multiplication_factor) ?? "n/a";

                    if (
                      min_vaild_value * 1 <= val &&
                      val <= max_valid_value * 1
                    ) {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = val.toFixed(2) * 1;

                      sendMessageToIndustry({
                        max_std_value,
                        min_std_value,
                        deviceName,
                        station_name,
                        parameter_name: parameter_name
                          .split("+")[0]
                          .replaceAll("_dot_", "."),
                        value: val.toFixed(2) * 1,
                        dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      });
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  } else {
                    values[parameter_name.split("+")[0] + "+" + station_name] =
                      "n/a";
                  }
                }
                break;
              case "4-20 mA":
                if (Number(Number_of_bytes) === 1) {
                  if (checkIsDataInArr(strData.dataIncZ)) {
                    const str = strData.dataIncZ.join(",");
                    const oprationalData = str
                      .slice(str.indexOf("Z") + 1)
                      .split(",");

                    const constant = (constant_value_420 * 1) / (range_420 * 1);
                    const value =
                      oprationalData[sequence_number - 1] * 1 -
                      constant_subtraction_420 * 1;

                    const val = parseFloat(
                      ((value / constant) * multiplication_factor).toFixed(2)
                    );

                    if (
                      min_vaild_value * 1 <= val &&
                      val <= max_valid_value * 1
                    ) {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = val.toFixed(2) * 1 ?? "n/a";

                      sendMessageToIndustry({
                        max_std_value,
                        min_std_value,
                        deviceName,
                        station_name,
                        parameter_name: parameter_name
                          .split("+")[0]
                          .replaceAll("_dot_", "."),
                        value: val.toFixed(2) * 1,
                        dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      });
                    } else {
                      values[
                        parameter_name.split("+")[0] + "+" + station_name
                      ] = "n/a";
                    }
                  } else {
                    values[parameter_name.split("+")[0] + "+" + station_name] =
                      "n/a";
                  }
                }
                break;
              default:
                values[parameter_name.split("+")[0] + "+" + station_name] = "";
            }
          }
        }

        if (!checkAllNA(values)) {
          const objsToSend = {};
          for (let i = 0; i < Object.entries(values).length; i++) {
            const [paraStationName, val] = Object.entries(values)[i];
            const parameter = paraStationName.split("+")[0];
            const station = paraStationName.split("+")[1];
            if (objsToSend[station]) {
              objsToSend[station][parameter] = val;
            } else {
              objsToSend[station] = {};
              objsToSend[station][parameter] = val;
            }
          }
          for (let j = 0; j < Object.entries(objsToSend).length; j++) {
            const [station, values] = Object.entries(objsToSend)[j];

            // sending data on given api starts
            // const devicesOfSendDataOnApi = ["M00485"];
            // const sentDataOnApi = async (api, dataObject) => {
            //   try {
            //     await axios.post(api, dataObject);
            //   } catch (error) {}
            // };

            // if (devicesOfSendDataOnApi.includes(deviceName)) {
            //   const timeStr = moment.tz(Date.now(), "Asia/Kolkata").format();
            //   const date = timeStr.split("T")[0];
            //   const time = timeStr.split("T")[1].split("+")[0];
            //   const ts = date + " " + time;

            //   const lowercaseVal = {};
            //   Object.entries(values).forEach(([key, val]) => {
            //     lowercaseVal[key.toLowerCase()] = val;
            //   });

            //   sentDataOnApi("https://apis.enggenv.com/api/v1/data/insert.php", {
            //     ...lowercaseVal,
            //     ts_client: ts,
            //     id: "ENE01940",
            //     api_key: "c2RrbGpmZHNmZHNzYWRmZHNhYWY=",
            //   });
            // }
            // sending data on given api ends

            DataValues.create({
              data_string: req.body.data,
              device_name: deviceName,
              instrument_id: instrumentID,
              function_code: functionCode,
              starting_register: startingRegister,
              station_name: station,
              data_values: values,
              created_at: dataCur,
              created_mili: Date.now(),
            }).catch((error) => {
              console.log(error.message);
            });
          }

          res.status(200).json({
            status: "rawdata added!",
            // data: {
            //   raw_data: doc,
            //   values: docValues,
            // },
          });
        } else {
          res.status(200).json({
            status: "rawdata added!",
            data: {
              raw_data: doc,
            },
          });
        }
      } else {
        res.status(200).json({
          status: "rawdata added!",
          data: {
            raw_data: doc,
          },
        });
      }
    } else {
      const doc = await RawData.create({
        data_string: req.body.data,
        device_name: null,
        created_at: dataCur,
      });
      res.status(200).json({
        status: "success",
        data: {
          raw_data: doc,
        },
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getIntervalsArr = (
  sDate,
  sMonth,
  sYear,
  sHour,
  sMin,
  sSec,
  eDate,
  eMonth,
  eYear,
  eHour,
  eMin,
  eSec,
  intervalMin,
  serverData
) => {
  // function
  const toMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString("en-US", {
      month: "long",
    });
  };

  // function
  const removeUnwantedTime = (arr, sHour, sMin, sSec, eHour, eMin, eSec) => {
    let mArr = [...arr];
    for (let i = 0; i < arr.length; i++) {
      const dataTimeArr = `${arr[i + 1]}`.split(" ")[4].split(":");
      if (sHour > dataTimeArr[0]) {
        mArr.shift();
      } else if (sMin > dataTimeArr[1] && sHour === dataTimeArr[0]) {
        mArr.shift();
      } else if (
        sSec > dataTimeArr[2] &&
        sMin === dataTimeArr[1] &&
        sHour === dataTimeArr[0]
      ) {
        mArr.shift();
      } else {
        break;
      }
    }
    for (let i = arr.length - 1; i >= 0; i--) {
      const dataTimeArr = `${arr[i - 1]}`.split(" ")[4].split(":");
      if (eHour < dataTimeArr[0]) {
        mArr.pop();
      } else if (eMin < dataTimeArr[1] && eHour === dataTimeArr[0]) {
        mArr.pop();
      } else if (
        eSec < dataTimeArr[2] &&
        eMin === dataTimeArr[1] &&
        eHour === dataTimeArr[0]
      ) {
        mArr.pop();
      } else {
        break;
      }
    }
    return mArr;
  };

  //function
  const dataUnderTimeInterval = (timeStamps, allData) => {
    const result = [];
    for (let i = 0; i < timeStamps.length - 1; i++) {
      let hold = {};
      for (let j = 0; j < allData.length; j++) {
        const startPoint = new Date(timeStamps[i]).getTime();
        const endPoint = new Date(timeStamps[i + 1]).getTime();
        const dataTime = new Date(
          `${allData[j].createdAt}`.split("+")[0]
        ).getTime();

        hold["created_At"] = timeStamps[i + 1];
        if (startPoint <= dataTime && endPoint > dataTime) {
          for (let [key, value] of Object.entries(allData[j])) {
            if (hold[`${key}`] && hold[`${key}COUNT`]) {
              hold[`${key}COUNT`] = hold[`${key}COUNT`] + 1;
              hold[`${key}`] = hold[`${key}`] + value;
            } else {
              hold[`${key}COUNT`] = 1;
              hold[`${key}`] = value;
            }
          }
        }
      }
      let obj = {};
      for (let [key, value] of Object.entries(hold)) {
        if (
          `${key}`.slice(`${key}`.length - 5, `${key}`.length) !== "COUNT" &&
          `${key}` !== "created_At"
        ) {
          obj[key] = value / hold[`${key}COUNT`];
        }
        if (!obj["createdAt"])
          obj["createdAt"] = hold["created_At"].toLocaleString();
      }
      result.push(obj);
    }
    return result;
  };

  const sDateTime = new Date(
    `${toMonthName(sMonth)} ${sDate}, ${sYear} ${sHour}:${sMin}:${sSec}`
  ).getTime();
  const eDateTime = new Date(
    `${toMonthName(eMonth)} ${eDate}, ${eYear} ${eHour}:${eMin}:${eSec}`
  ).getTime();

  let allTimeStamps = [];
  let i = sDateTime * 1;
  while (i <= eDateTime + 1000 * 60 * intervalMin) {
    allTimeStamps.push(new Date(i));
    i = i + 1000 * 60 * intervalMin;
  }

  const filteredTimeStamps = removeUnwantedTime(
    allTimeStamps,
    sHour,
    sMin,
    sSec,
    eHour,
    eMin,
    eSec
  );
  return dataUnderTimeInterval(filteredTimeStamps, serverData);
};

exports.getDataValuesByDeviceName = async (req, res) => {
  const startDateArr = req.params.start_date.split("-");
  const endDateArr = req.params.end_date.split("-");
  const startTimeArr = req.params.start_time.split(":");
  const endTimeArr = req.params.end_time.split(":");

  const reqStartDate = startDateArr[2];
  const reqEndDate = endDateArr[2];
  const reqStartMonth = startDateArr[1];
  const reqEndMonth = endDateArr[1];
  const reqStartYear = startDateArr[0];
  const reqEndYear = endDateArr[0];

  const reqStartHour = startTimeArr[0];
  const reqStartMin = startTimeArr[1];
  const reqStartSec = startTimeArr[2];
  const reqEndHour = endTimeArr[0];
  const reqEndMin = endTimeArr[1];
  const reqEndSec = endTimeArr[2];

  const reqDeviceName = req.params.device_name.split("+");
  const reqTimeInterval = req.params.interval * 1;

  const startMiliSec = new Date(
    `${reqStartYear * 1}-${
      reqStartMonth * 1 < 9 ? "0" + reqStartMonth * 1 : reqStartMonth * 1
    }-${reqStartDate * 1 < 9 ? "0" + reqStartDate * 1 : reqStartDate * 1}T${
      reqStartHour * 1 < 9 ? "0" + reqStartHour * 1 : reqStartHour * 1
    }:${reqStartMin * 1 < 9 ? "0" + reqStartMin * 1 : reqStartMin * 1}:${
      reqStartSec * 1 < 9 ? "0" + reqStartSec * 1 : reqStartSec * 1
    }+05:30`
  ).getTime();

  const endMiliSec = new Date(
    `${reqEndYear * 1}-${
      reqEndMonth * 1 < 9 ? "0" + reqEndMonth * 1 : reqEndMonth * 1
    }-${reqEndDate * 1 < 9 ? "0" + reqEndDate * 1 : reqEndDate * 1}T${
      reqEndHour * 1 < 9 ? "0" + reqEndHour * 1 : reqEndHour * 1
    }:${reqEndMin * 1 < 9 ? "0" + reqEndMin * 1 : reqEndMin * 1}:${
      reqEndSec * 1 < 9 ? "0" + reqEndSec * 1 : reqEndSec * 1
    }+05:30`
  ).getTime();

  try {
    const dataValues = await DataValues.find({
      device_name: reqDeviceName,
      created_mili: {
        $gte: startMiliSec,
        $lt: endMiliSec,
      },
    }).exec();

    let filteredData = [];
    for (let i = 0; i < dataValues.length; i++) {
      let obj = {};

      for (const key in dataValues[i].data_values) {
        obj[key] = dataValues[i].data_values[key];
      }
      obj["createdAt"] = dataValues[i].created_at;

      filteredData.push(obj);
    }

    if (filteredData.length > 0) {
      res.status(200).json({
        status: "sucess",
        data: getIntervalsArr(
          reqStartDate,
          reqStartMonth,
          reqStartYear,
          reqStartHour,
          reqStartMin,
          reqStartSec,
          reqEndDate,
          reqEndMonth,
          reqEndYear,
          reqEndHour,
          reqEndMin,
          reqEndSec,
          reqTimeInterval,
          filteredData
        ),
      });
    } else {
      res.status(200).json({
        status: "sucess",
        data: filteredData,
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.updateDataFromCSV = (req, res) => {
  try {
    const parameters = req.params.parameters
      .split(",")
      .map((item) => [item.split(":")[0], item.split(":")[1] * 1]);
    const csvDataArr = Object.keys(req.body)[0].split("\r\n");
    const allDataValues = [];
    for (let i = 1; i < csvDataArr.length; i++) {
      const elementArr = csvDataArr[i].split(",");
      const dataValue = {};
      dataValue.device_name = req.params.device_name;
      const dataValues = [];
      parameters.forEach((para) => {
        const data = para[0];
        const val = para[1];
        let hold = {};
        hold[data] = elementArr[val];
        dataValues.push(hold);
      });
      dataValue.data_value = dataValues;
      allDataValues.push(dataValue);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
};
