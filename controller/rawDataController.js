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
      const doc = await RawData.create({
        data_string: req.body.data,
        device_name: deviceName,
        instrument_id: instrumentID,
        function_code: functionCode,
        starting_register: startingRegister,
        created_at: dataCur,
        created_date: `${dataCur.split("T")[0]}`,
      });
      res.status(200).json({
        status: "rawdata added!",
        data: {
          raw_data: doc,
        },
      });
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
