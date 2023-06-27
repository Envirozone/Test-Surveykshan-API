const DataValues = require('../Models/dataValuesModel');
const DataSetting = require('../Models/dataSettingModelThird');
const PCBLogs = require('../Models/pcbLogsModel');

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const format = require('date-format');

const { getDb } = require('./../db.js');

dotenv.config();

const setDataTOJharkhand = function (config, industry_name, deviceName) {
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

  axios({
    method: 'GET',
    url,
  })
    .then((res) => {
      if (
        res.status === 200 &&
        res.statusText === 'OK' &&
        res.data.includes('>1<')
      ) {
        PCBLogs.create({
          industry_name: industry_name || '',
          device_name: deviceName,
          data: url,
          board: 'JHPCB',
          status: String(res.status),
          send: true,
          message: res.data,
          createdAt: new Date().getTime(),
        });
      } else {
        PCBLogs.create({
          industry_name: industry_name || '',
          device_name: deviceName,
          data: url,
          board: 'JHPCB',
          status: String(res.status),
          send: false,
          message: res.data,
          createdAt: new Date().getTime(),
        });
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
};

mongoose
  .connect(getDb(), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then(() => {
    setInterval(function () {
      DataSetting.aggregate([
        {
          $unwind: '$parameters',
        },
        {
          $match: {
            'parameters.to_pcb': 'JH',
          },
        },
        {
          $project: {
            device_name: '$device_name',
            industry_name: '$industry_name',
            instrument: '$parameters.instrument',
            parameter_name: '$parameters.parameter_name',
            parameter_custom_name: '$parameters.parameter_custom_name',
            industry_pb_id: '$parameters.industry_pb_id',
            station_pb_id: '$parameters.station_pb_id',
            device_pb_id: '$parameters.device_pb_id',
            starting_register: '$parameters.starting_register',
            function_value: '$parameters.function_value',
            analyzer_id: '$parameters.analyzer_id',
          },
        },
      ])
        .then((result) => {
          for (let i = 0; i < result.length; i++) {
            const element = result[i];
            const instrument = element.instrument.slice(
              element.instrument.indexOf('(') + 1,
              element.instrument.indexOf(')')
            );

            DataValues.findOne({
              device_name: element.device_name,
              instrument_id: instrument,
              function_code: element.function_value,
              starting_register: element.starting_register,
            })
              .sort({ _id: -1 })
              .select('created_at data_values -_id')
              .then((res) => {
                if (res) {
                  const currTime = new Date().getTime();
                  const time = new Date(res.created_at).getTime();

                  if (currTime - 1000 * 60 * 5 < time) {
                    const parameterNameWithDot = element.parameter_name
                      .split('+')[0]
                      .replaceAll('.', '_dot_');
                    if (
                      (res.data_values[parameterNameWithDot] ||
                        res.data_values[parameterNameWithDot] === 0) &&
                      res.data_values[parameterNameWithDot] !== 'n/a'
                    ) {
                      setDataTOJharkhand(
                        {
                          venderId: 21,
                          industryId: element.industry_pb_id,
                          stationId: element.station_pb_id,
                          analyserId: element.analyzer_id,
                          parameterName: element.parameter_custom_name,
                          unit: element.parameter_name.split('+')[1],
                          val: res.data_values[parameterNameWithDot],
                          timeStamp: format('yyyy-MM-dd hh:mm:ss', new Date()),
                        },
                        element.industry_name,
                        element.device_name
                      );
                    }
                  }
                }
              })
              .catch((error) => {
                console.log(error.message);
              });
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }, 1000 * 60 * 5);
  })
  .catch((error) => {
    console.log(error.message);
  });
