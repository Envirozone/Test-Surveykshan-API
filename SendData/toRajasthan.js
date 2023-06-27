const DataValues = require('../Models/dataValuesModel');
const DataSetting = require('../Models/dataSettingModelThird');
const PCBLogs = require('../Models/pcbLogsModel');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment-timezone');
const JSZip = require('jszip');
const FormData = require('form-data');
const schedule = require('node-schedule');
const unixTime = require('unix-timestamp');

const { getDb } = require('./../db.js');

dotenv.config();

const extractData = (arr) => {
  const collectionFoPackages = [];
  let site_holded = null;
  let package = [];
  for (let i = 0; i < arr.length; i++) {
    const site_id = arr[i].split(',')[0];

    if (site_holded === null) {
      site_holded = site_id;
      package.push(arr[i]);
    } else if (site_holded === site_id) {
      package.push(arr[i]);
    } else if (site_holded !== site_id) {
      collectionFoPackages.push(package);
      package = [];
      site_holded = site_id;
      package.push(arr[i]);
    }

    if (i === arr.length - 1) {
      collectionFoPackages.push(package);
    }
  }

  const allCollection = [];
  for (let j = 0; j < collectionFoPackages.length; j++) {
    let configObj = {};
    configObj.config = {};
    const element = collectionFoPackages[j];
    const firstStrData = element[0].split(',');

    configObj.config.siteId = firstStrData[0];
    configObj.config.encryptionKey = element[0].split('++')[1];
    configObj.config.monitoringID = firstStrData[2];
    configObj.config.sensorParamMapping = {};
    configObj.config.parametersMapping = {};
    configObj.data = [];

    for (let k = 0; k < element.length; k++) {
      const item = element[k].split('++')[0].split(',');
      configObj.config.sensorParamMapping[`D${k}`] = item[5];
      const parameterMap = {
        parameterID: item[4],
        analyserID: item[3],
        monitoringID: item[2],
        unitID: item[7],
      };
      configObj.config.parametersMapping[item[5]] = parameterMap;
      configObj.data.push(
        `${element[k].split('++')[0]},${unixTime.now().toFixed(0)},0,0`
      );
    }
    allCollection.push(configObj);
  }

  return allCollection;
};

const metadata =
  'SITE_ID,SITE_UID,MONITORING_UNIT_ID,ANALYZER_ID,PARAMETER_ID,PARAMETER_NAME,READING,UNIT_ID,DATA_QUALITY_CODE,RAW_READING,UNIX_TIMESTAMP,CALIBRATION_FLAG,MAINTENANCE_FLAG';

schedule.scheduleJob('30 18 * * *', function () {
  const devIDs = Object.keys(configuration);
  for (const devID of devIDs) {
    if (configuration[devID].totalizerTag) {
      configuration[devID].previousDayTotalizerValue = null;
    }
  }
});

const formatData = async (data, deviceConfig) => {
  let dataToBeReturned = '';
  const { siteId, parametersMapping, encryptionKey } = deviceConfig;
  data.forEach((point) => {
    let data = `${point}\n`;
    dataToBeReturned = dataToBeReturned.concat(data);
  });

  dataToBeReturned = dataToBeReturned.substring(0, dataToBeReturned.length - 1); //Removed "\n" character from the end

  let dataToBeReturnedLength = dataToBeReturned.length;

  // if (dataToBeReturnedLength % 16 != 0) {
  //   let lengthOfPadding = 16 - (dataToBeReturnedLength % 16);

  //   for (let i = 0; i < lengthOfPadding + 16; i++) {
  //     dataToBeReturned = `${dataToBeReturned}#`;
  //   }
  // }
  const encryptedText = encryptUsingAES(encryptionKey, null, dataToBeReturned);
  return dataToBeReturned;
};

const encryptUsingAES = (key, iv, data, isAutoPadding) => {
  if (!iv) iv = Buffer.alloc(16);

  key = key.slice(0, 32);

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv)
  );

  if (!isAutoPadding) cipher.setAutoPadding(false);

  const encryptedData = cipher.update(data, 'utf-8', 'base64');

  return `${encryptedData}`;
};

const sendRealTimeData = async (
  fileName,
  content,
  time,
  deviceConfig,
  industry_name,
  deviceName,
  rawData
) => {
  try {
    time = parseInt(`${time}000`) - 19800000;
    const { siteId, encryptionKey } = deviceConfig;
    const authMessage = `${siteId},ver_1.0,${moment(time)
      .utc()
      .add(5.5, 'h')
      .format()},${encryptionKey}`;
    const formData = new FormData();

    formData.append('file', content, { filename: fileName });

    const response = await axios({
      method: 'post',
      url: 'http://103.203.138.50/GLensServer/upload',
      data: formData,
      headers: {
        Authorization: `Basic ${encryptUsingAES(
          encryptionKey,
          null,
          authMessage,
          true
        )}${Buffer.alloc(16).toString('base64')}`,
        siteId: siteId,
        Timestamp: moment(time).utc().add(5.5, 'h').format(),
        ...formData.getHeaders(),
      },
    });
    if (response?.data) {
      if (response.data.status === 'Success') {
        PCBLogs.create({
          industry_name: industry_name || '',
          device_name: deviceName || '',
          data: JSON.stringify(rawData),
          board: 'RJPCB',
          status: String(response.data.status),
          send: true,
          message: response.data.statusMessage,
          createdAt: new Date().getTime(),
        });
      } else {
        PCBLogs.create({
          industry_name: industry_name || '',
          device_name: deviceName || '',
          data: JSON.stringify(rawData),
          board: 'RJPCB',
          status: String(response.data.status),
          send: false,
          message: response.data.statusMessage,
          createdAt: new Date().getTime(),
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const generateZipFile = async (metadata, data, deviceConfig) => {
  try {
    const zip = new JSZip();

    const { monitoringID, siteId } = deviceConfig;
    let uploadTime = moment.tz('Asia/Calcutta').format('YYYY MM DD HH mm ss');
    uploadTime = uploadTime.split(' ').join('');

    zip.file('metadata.csv', metadata);
    zip.file(`${siteId}_${monitoringID}_${uploadTime}.csv`, data);
    zip.name = `${siteId}_${monitoringID}_${uploadTime}.zip`;
    const content = await zip.generateAsync({ type: 'nodebuffer' });

    // zip
    //   .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    //   .pipe(fs.createWriteStream(`${zip.name}`))
    //   .on("finish", function () {
    //     console.log("sample.zip written.");
    //   });

    return { content, fileName: zip.name };
  } catch (error) {
    return Promise.reject(error);
  }
};

const zipData = async (
  data,
  deviceConfig,
  time,
  industry_name,
  deviceName,
  rawData
) => {
  try {
    let encryptedData = formatData(data, deviceConfig);
    const { content, fileName } = await generateZipFile(
      metadata,
      encryptedData,
      deviceConfig
    );
    await sendRealTimeData(
      fileName,
      content,
      time,
      deviceConfig,
      industry_name,
      deviceName,
      rawData
    );
    // }
  } catch (error) {
    return Promise.reject(error);
  }
};

const fetchData = (data, industry_name, deviceName, rawData) => {
  const dataToBeSend = extractData(data);
  for (let i = 0; i < dataToBeSend.length; i++) {
    const element = dataToBeSend[i];
    zipData(
      element.data,
      element.config,
      moment().unix() + 19800,
      industry_name,
      deviceName,
      rawData
    );
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
            'parameters.to_pcb': 'RJ',
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
            site_id: '$parameters.site_id',
            site_uid: '$parameters.site_uid',
            monitoring_id: '$parameters.monitoring_id',
            analyzer_id: '$parameters.analyzer_id',
            parameter_pb_id: '$parameters.parameter_pb_id',
            unit_id: '$parameters.unit_id',
            device_pb_id: '$parameters.device_pb_id',
            starting_register: '$parameters.starting_register',
            function_value: '$parameters.function_value',
            key: '$parameters.key',
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
              station_name: stationId,
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
                      const {
                        site_id,
                        site_uid,
                        monitoring_id,
                        analyzer_id,
                        unit_id,
                        parameter_pb_id,
                        key,
                      } = element;
                      const parameter_name =
                        element.parameter_name.split('+')[0];
                      const parameter_unit =
                        element.parameter_name.split('+')[1];
                      if (
                        (res.data_values[parameter_name] ||
                          res.data_values[parameter_name] === 0) &&
                        res.data_values[parameter_name] !== 'n/a'
                      ) {
                        dataArr.push(
                          `${site_id},${site_uid},${monitoring_id},${analyzer_id},${parameter_pb_id},${
                            parameter_name.split('+')[0]
                          },${
                            res.data_values[parameter_name.split('+')[0]]
                          },${unit_id},U,${
                            res.data_values[parameter_name.split('+')[0]]
                          }++dummykeyusedhereooooooooooooooooooooo####`
                        );
                      }
                    }

                    fetchData(
                      dataArr,
                      value[0]?.industry_name || '',
                      value[0]?.device_name || '',
                      dataArr.map((str) => str.split('++')[0])
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
