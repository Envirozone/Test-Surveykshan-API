const DataSetting = require('../Models/dataSettingModelThird');
const DataValues = require('../Models/dataValuesModel');

exports.getDeviceData = async (req, res) => {
  DataSetting.aggregate([
    {
      $unwind: '$parameters',
    },
    {
      $match: {
        device_name: { $in: req.params.device_name.split('+') },
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
        station_name: '$parameters.station_name',
        station_pb_id: '$parameters.station_pb_id',
        device_pb_id: '$parameters.device_pb_id',
        starting_register: '$parameters.starting_register',
        function_value: '$parameters.function_value',
        min_std_value: '$parameters.min_std_value',
        max_std_value: '$parameters.max_std_value',
        min_vaild_value: '$parameters.min_vaild_value',
        max_valid_value: '$parameters.max_valid_value',
        created_at: '$createdAt',
      },
    },
  ]).then((resp) => {
    const strKeys = {};
    const seprator = '____';
    for (let i = 0; i < resp.length; i++) {
      const ele = resp[i];
      const str = `${ele.device_name}${seprator}${ele.instrument.slice(
        ele.instrument.indexOf('(') + 1,
        ele.instrument.indexOf(')')
      )}${seprator}${ele.function_value}${seprator}${
        ele.starting_register
      }${seprator}${ele.station_name}`;
      if (!strKeys[str]) {
        strKeys[str] = [];
        strKeys[str].push(ele);
      } else {
        strKeys[str].push(ele);
      }
    }

    const strKeysArr = Object.entries(strKeys);

    const fun = async function () {
      let holdValues = [];
      for (let j = 0; j < strKeysArr.length; j++) {
        const [
          device_name,
          instrument_id,
          function_code,
          starting_register,
          station_name,
        ] = strKeysArr[j][0].split(seprator);

        const data = await DataValues.findOne({
          device_name,
          instrument_id,
          function_code,
          starting_register,
          station_name,
        }).sort({ _id: -1 });

        if (data && data.data_values) {
          for (let n = 0; n < Object.entries(data.data_values).length; n++) {
            let [paraName, paraVal] = Object.entries(data.data_values)[n];
            paraName = paraName.replaceAll('_dot_', '.');
            for (let m = 0; m < strKeysArr[j][1].length; m++) {
              const element = strKeysArr[j][1][m];
              if (paraName === element.parameter_name.split('+')[0]) {
                holdValues.push({
                  station_name,
                  parameter_name: element.parameter_custom_name,
                  parameter_unit: element.parameter_name.split('+')[1],
                  min_std_value: element.min_std_value,
                  max_std_value: element.max_std_value,
                  min_valid_value: element.min_vaild_value,
                  max_valid_value: element.max_valid_value,
                  created_at: data.created_at,
                  value: paraVal,
                });
              }
            }
          }
        } else {
          for (let m = 0; m < strKeysArr[j][1].length; m++) {
            const element = strKeysArr[j][1][m];

            holdValues.push({
              parameter_name: element.parameter_custom_name,
              parameter_unit: element.parameter_name.split('+')[1],
              min_std_value: element.min_std_value,
              max_std_value: element.max_std_value,
              min_valid_value: element.min_vaild_value,
              max_valid_value: element.max_valid_value,
              created_at: 'never',
              value: 'n/a',
            });
          }
        }
      }

      return holdValues;
    };

    fun()
      .then((values) => {
        res.status(200).json({
          status: 'success',
          values,
        });
      })
      .catch((error) => {
        res.status(404).json({
          status: 'Failed',
          message: error.message,
        });
      });
  });
};

exports.getDeviceDataObj = async (req, res) => {
  DataSetting.aggregate([
    {
      $unwind: '$parameters',
    },
    {
      $match: {
        device_name: { $in: req.params.device_name.split('+') },
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
        station_name: '$parameters.station_name',
        device_pb_id: '$parameters.device_pb_id',
        starting_register: '$parameters.starting_register',
        function_value: '$parameters.function_value',
        created_at: '$createdAt',
      },
    },
  ]).then((resp) => {
    const strKeys = {};
    const seprator = '____';
    for (let i = 0; i < resp.length; i++) {
      const ele = resp[i];
      const str = `${ele.device_name}${seprator}${ele.instrument.slice(
        ele.instrument.indexOf('(') + 1,
        ele.instrument.indexOf(')')
      )}${seprator}${ele.function_value}${seprator}${
        ele.starting_register
      }${seprator}${ele.station_name}`;
      if (!strKeys[str]) {
        strKeys[str] = [];
        strKeys[str].push(ele);
      } else {
        strKeys[str].push(ele);
      }
    }

    const strKeysArr = Object.entries(strKeys);

    const fun = async function () {
      let holdValues = [];
      for (let j = 0; j < strKeysArr.length; j++) {
        const [
          device_name,
          instrument_id,
          function_code,
          starting_register,
          station_name,
        ] = strKeysArr[j][0].split(seprator);

        const data = await DataValues.findOne({
          device_name,
          instrument_id,
          function_code,
          starting_register,
          station_name,
        }).sort({ _id: -1 });

        if (data && data.data_values) {
          for (let n = 0; n < Object.entries(data.data_values).length; n++) {
            let [paraName, paraVal] = Object.entries(data.data_values)[n];
            paraName = paraName.replaceAll('_dot_', '.');

            for (let m = 0; m < strKeysArr[j][1].length; m++) {
              const element = strKeysArr[j][1][m];
              if (paraName === element.parameter_name.split('+')[0]) {
                holdValues.push({
                  parameter_name: element.parameter_name.split('+')[0],
                  value: paraVal,
                });
              }
            }
          }
        } else {
          for (let m = 0; m < strKeysArr[j][1].length; m++) {
            const element = strKeysArr[j][1][m];

            holdValues.push({
              parameter_name: element.parameter_name.split('+')[0],
              value: 'n/a',
            });
          }
        }
      }

      return holdValues;
    };

    fun()
      .then((values) => {
        const obj = {};
        for (let i = 0; i < values.length; i++) {
          const element = values[i];
          obj[element.parameter_name] = element.value;
        }
        res.status(200).json(obj);
      })
      .catch((error) => {
        res.status(404).json({
          status: 'Failed',
          message: error.message,
        });
      });
  });
};
