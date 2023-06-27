const DataValues = require('../Models/dataValuesModel');
const DataSetting = require('../Models/dataSettingModelThird');
const PCBLogs = require('../Models/pcbLogsModel');

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const { getDb } = require('./../db.js');

dotenv.config();

const setDataTOPCB = async function (
  industry_pb_id,
  station_pb_id,
  data,
  industry_name,
  deviceName
) {
  try {
    axios({
      method: 'post',
      url: `http://ppcbcems.nic.in/ppcpcb-api/api/industry/${industry_pb_id}/station/${station_pb_id}/data`,
      data,
      headers: {
        Authorization: `Basic MzAwNzIwMjBfZW1wb3dlcl9kYXRhbHl6ZXJzX3NvbHV0aW9uc19zdXJ2ZXlrc2hhbl9fd3otMzUwMDFfcmFqYV9wYXJrX3BpdGFtcHVyYV9uZXdfZGVsaGlfLV8xMTAwMzRfMTQ0ODUx`,
      },
    })
      .then((res) => {
        if (Number(res.data.status) === 1) {
          PCBLogs.create({
            industry_name: industry_name || '',
            device_name: deviceName,
            data: JSON.stringify(data),
            board: 'PBPCB',
            status: String(res.data.status),
            send: true,
            message: res.data.msg,
            createdAt: new Date().getTime(),
          });
        } else {
          PCBLogs.create({
            industry_name: industry_name || '',
            device_name: deviceName,
            data: JSON.stringify(data),
            board: 'PBPCB',
            status: String(res.data.status),
            send: false,
            message: res.data.msg,
            createdAt: new Date().getTime(),
          });
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  } catch (error) {
    console.log(error);
  }
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
            'parameters.to_pcb': 'PB',
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
          },
        },
      ])
        .then((result) => {
          const obj = {};
          for (let i = 0; i < result.length; i++) {
            const element = result[i];
            const seprator = '____';
            const instrument = element.instrument.slice(
              element.instrument.indexOf('(') + 1,
              element.instrument.indexOf(')')
            );

            const objProperty = `${element.industry_pb_id}${seprator}${element.station_pb_id}${seprator}${element.device_name}${seprator}${instrument}${seprator}${element.function_value}${seprator}${element.starting_register}`;
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
              deviceName,
              instrumentId,
              functionCode,
              startingRegister,
            ] = key.split('____');

            DataValues.findOne({
              device_name: deviceName,
              instrument_id: instrumentId,
              function_code: functionCode,
              starting_register: startingRegister,
            })
              .sort({ _id: -1 })
              .select('created_at data_values -_id')
              .then((res) => {
                if (res) {
                  const currTime = new Date().getTime();
                  const time = new Date(res.created_at).getTime();

                  if (currTime - 1000 * 60 * 5 < time) {
                    const dataArr = [];
                    for (let k = 0; k < value.length; k++) {
                      const element = value[k];
                      const parameter_name =
                        element.parameter_name.split('+')[0];
                      const parameter_unit =
                        element.parameter_name.split('+')[1];
                      if (
                        (res.data_values[parameter_name] ||
                          res.data_values[parameter_name] === 0) &&
                        res.data_values[parameter_name] !== 'n/a'
                      ) {
                        dataArr.push({
                          deviceId: element.device_pb_id,
                          params: [
                            {
                              parameter: element.parameter_custom_name,
                              value: res.data_values[parameter_name],
                              unit: parameter_unit,
                              timestamp: new Date().getTime(),
                              flag: 'U',
                            },
                          ],
                        });
                      }
                    }
                    setDataTOPCB(
                      industryId,
                      stationId,
                      dataArr,
                      value[0].industry_name,
                      value[0].device_name
                    );
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
