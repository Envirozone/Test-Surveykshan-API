const mongoose = require("mongoose");
const DataSetting = require("../Models/dataSettingModelThird");
const IndustriesModel = require("../Models/industriesModel");
const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const axios = require("axios");

const { getDb } = require("./../db.js");

dotenv.config();

const data = require("./master");
const Industries = require("../Models/industriesModel");
const users = data["Surveykshan-Industry Login"];

const getFullDate = (date) => {
  date = new Date(date);
  let day = String(date.getDate());
  let month = String(date.getUTCMonth());
  let year = String(date.getFullYear());

  day = day.length === 1 ? "0" + day : day;
  month = month.length === 1 ? "0" + month : month;

  return `${year}-${month}-${day}`;
};

mongoose
  .connect(getDb(), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then(async () => {
    // for (let i = 0; i < data.length; i++) {
    //   const { userID, lastRenewalDate, station, parameters } = data[i];

    //   const seprateDate = lastRenewalDate.split("/");
    //   const date = `${seprateDate[2]}-${seprateDate[0]}-${seprateDate[1]}`;

    //   const resp = await User.findOneAndUpdate(
    //     { username: userID },
    //     {
    //       $push: {
    //         subscribtions: {
    //           from: date,
    //           till: 365,
    //           station_name: station,
    //           parameters: parameters.split("/"),
    //         },
    //       },
    //     }
    //   );
    //   console.log(resp);
    // }

    const resp = await User.findOneAndUpdate(
      { username: "serviceengineer" },
      {
        $push: {
          subscribtions: {
            from: "2023-06-01",
            till: 1000000,
            station_name: "",
            parameters: [],
          },
        },
      }
    );
    console.log(resp);

    // for (let i = 0; i < data.length; i++) {
    //   const { IndustryName, IndustryId } = data[i];
    //   const resp = await Industries.findOneAndUpdate(
    //     { industry_name: IndustryName },
    //     { industry_pb_id: IndustryId },
    //     { returnOriginal: false }
    //   );
    //   console.log(resp);
    // }

    // DataSetting.updateMany(
    //   { "parameters.parameter_custom_name": "PM" },
    //   { "parameters.parameter_custom_name": "SPM" }
    // ).then((res) => {
    //   console.log(res);
    // });

    /* 
    try {
      const update = User.updateMany(
        {},
        {
          $set: { subscribtions: [] },
        }
      );
      console.log(update);
    } catch (error) {
      console.log(error);
    }
    */

    // const result = await Industries.updateMany({},{show_to_CPCB:"true",show_to_PCB:"true"})
    // console.log(result)

    /*
    IndustriesModel.find()
      .select('industry_name -_id')
      .then(async (res) => {
        for (let i = 0; i < res.length; i++) {
          const { industry_name } = res[i];

          const datasetting = await DataSetting.find({ industry_name }).select(
            'industry_name parameters.to_cpcb -_id'
          );
          // console.log(datasetting);
          let hold = 'false';
          if (datasetting.length > 0) {
            for (let j = 0; j < datasetting.length; j++) {
              const element = datasetting[j];
              for (let k = 0; k < element.parameters.length; k++) {
                const { to_cpcb } = element.parameters[k];
                if (to_cpcb === 'true' && hold === 'false') hold = 'true';
              }
            }
          }

          if (hold === 'false' &&  datasetting[0]?.industry_name) {
           const result = await Industries.findOneAndUpdate({industry_name:datasetting[0]?.industry_name},{show_to_CPCB:"false"})
           console.log(result.industry_name)
          }
        }
      });
  */

    /* 
IndustriesModel.find()
.select('industry_name -_id')
.then(async (res) => {
  for (let i = 0; i < res.length; i++) {
    const { industry_name } = res[i];

    const datasetting = await DataSetting.find({ industry_name }).select(
      'industry_name parameters.to_pcb -_id'
    );
    // console.log(datasetting);

    let hold = 'false';
    if (datasetting.length > 0) {
      for (let j = 0; j < datasetting.length; j++) {
        const element = datasetting[j];
        for (let k = 0; k < element.parameters.length; k++) {
          const { to_pcb } = element.parameters[k];
          if (to_pcb !== '' && hold === 'false') hold = 'true';
        }
      }
    }

    if (hold === 'false' &&  datasetting[0]?.industry_name) {
     const result = await Industries.findOneAndUpdate({industry_name:datasetting[0]?.industry_name},{show_to_PCB:"false"})
     console.log(result.industry_name)
    }
  }
}); 
*/
    // let spcb = '';
    // if (state === 'Delhi') {
    //   spcb = 'DL';
    // } else if (state === 'Haryana') {
    //   spcb = 'HR';
    // } else if (state === 'Rajasthan') {
    //   spcb = 'RJ';
    // } else if (state === 'Punjab') {
    //   spcb = 'PB';
    // } else if (state === 'Bihar') {
    //   spcb = 'BH';
    // } else if (state === 'Jharkhand') {
    //   spcb = 'JH';
    // } else if (state === 'Maharashtra') {
    //   spcb = 'MAH';
    // } else if (state === 'Maharashtra') {
    //   spcb = 'MAH';
    // }
    /*
    IndustriesModel.find({ state: 'Delhi' })
      .select('industry_name -_id')
      .then(async (res) => {
        for (let i = 0; i < res.length; i++) {
          const { industry_name } = res[i];

          const updated = await DataSetting.updateOne(
            { industry_name },
            { 'parameters.$[].to_pcb': 'DL' }
          );
          console.log(updated);
        }
      });
 */
    /*
    const updated = await DataSetting.updateMany(
      {  },
      { 'parameters.$[].to_cpcb': 'true' }
    );
    console.log(updated)
     */

    /* 
    const holdParaUsingKeyIndustryDevice = {};
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const { IndustryName, DeviceName } = element;
      const industryName = IndustryName.split(' ').join('SPACE');
      const seprator = '____';
      const fetchedIndustryId = await IndustriesModel.findOne({
        industry_name: IndustryName,
      }).select('_id');
      const fetchedDeviceId = await IndustriesModel.findOne({
        'devices.device_name': DeviceName,
      }).select('devices._id -_id');

      const parameter = {
        instrument: `${
          element?.InstrumentName === 'NM'
            ? `(${element?.InstrumentName})`
            : element?.InstrumentName ?? ''
        }`.trim(),
        parameter_name: `${element?.ParameterName}+${
          element?.Unit ?? ''
        }`.trim(),
        station_name: `${element?.StationName ?? ''}`.trim(),
        industry_pb_id: `${element?.IndustryId ?? ''}`.trim(),
        station_pb_id: `${element?.StationId ?? ''}`.trim(),
        device_pb_id: `${element?.DeviceId ?? ''}`.trim(),
        device_param_pb_id: `${element?.Deviceparamid ?? ''}`.trim(),
        site_id: `${element?.SiteID ?? ''}`.trim(),
        site_uid: `${element?.SiteUID ?? ''}`.trim(),
        monitoring_id: `${element?.MonitoringUnitID ?? ''}`.trim(),
        analyzer_id: `${element?.AnalyzerID ?? ''}`.trim(),
        parameter_pb_id: `${element?.ParameterID ?? ''}`.trim(),
        unit_id: `${element?.UnitID ?? ''}`.trim(),
        key: '',
        parameter_custom_name: `${element?.ParamNameCustom ?? ''}`.trim(),
        sequence_number: `${element?.SequenceNo ?? ''}`.trim(),
        Number_of_bytes: `${element?.noOfByte ?? ''}`.trim(),
        holding_register_number: `${element?.HoldingRegisterNo ?? ''}`.trim(),
        starting_register: `${element?.StartingRegister ?? ''}`.trim(),
        function_value: `${element?.FunctionValue ?? ''}`.trim(),
        min_std_value: `${element?.MinStdValue ?? ''}`.trim(),
        max_std_value: `${element?.MaxStdValue ?? ''}`.trim(),
        multiplication_factor: `${element?.MultiplicationFactor ?? ''}`.trim(),
        conversion_type: `${element?.ConversionType ?? ''}`.trim(),
        constant_value_420: `${element?.ConstantValue420 ?? '0'}`.trim(),
        range_420: `${element?.Range420 ?? '0'}`.trim(),
        constant_subtraction_420: '0',
        to_pcb: `${element?.ToPCB ?? ''}`.trim(),
        byte_reading_order: `${element?.ByteReadingOrder ?? ''}`.trim(),
        min_vaild_value: `${element?.MinValidValue ?? ''}`.trim(),
        max_valid_value: `${element?.MaxValidValue ?? ''}`.trim(),
        z_data: '0',
        status: 'true',
        parameter_status: 'true',
        device_status: 'true',
        client_status: 'true',
        to_cpcb: element?.ToCPCB === 'Yes' ? 'true' : 'false',
        two_way_communication: 'true',
      };

      const objProperty = `${industryName}${seprator}${DeviceName}`;
      if (holdParaUsingKeyIndustryDevice[objProperty]) {
        holdParaUsingKeyIndustryDevice[objProperty].parameters.push(parameter);
      } else {
        holdParaUsingKeyIndustryDevice[objProperty] = {
          industry_name: IndustryName,
          industry_id: `${fetchedIndustryId?._id}` || '',
          device_name: DeviceName,
          device_id: `${fetchedDeviceId?.devices[0]?._id}` || '',
          parameters: [],
        };
        holdParaUsingKeyIndustryDevice[objProperty].parameters.push(parameter);
      }
    }
    for (
      let j = 0;
      j < Object.values(holdParaUsingKeyIndustryDevice).length;
      j++
    ) {
      const element = Object.values(holdParaUsingKeyIndustryDevice)[j];
      try {
        const doc = await DataSetting.create(element);
        console.log(doc);
      } catch (error) {
        console.log(error.message);
      }
    }
  */
  })
  .catch((error) => {
    console.log(error.message);
  });

/*
  for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const resp = await DataSetting.findOneAndUpdate(
        {
          industry_name: element?.IndustryName,
          device_name: element?.DeviceName,
          'parameters.parameter_custom_name': element?.ParamNameCustom,
          'parameters.station_name': element?.StationName,
          'parameters.station_pb_id': element?.StationId,
        },
        {
          $set: {
            'parameters.$.parameter_name': `${element?.ParameterName}+${element?.Unit}`,
            'parameters.$.instrument': `${element?.InstrumentName}` ?? '',
            'parameters.$.industry_pb_id': element?.IndustryId ?? '',
            'parameters.$.device_pb_id': element?.DeviceId ?? '',
            'parameters.$.device_param_pb_id': element?.Deviceparamid ?? '',
            'parameters.$.site_id': element?.SiteID ?? '',
            'parameters.$.site_uid': element?.SiteUID ?? '',
            'parameters.$.monitoring_id': element?.MonitoringUnitID ?? '',
            'parameters.$.analyzer_id': element?.AnalyzerID ?? '',
            'parameters.$.parameter_pb_id': element?.ParameterID ?? '',
            'parameters.$.unit_id': element?.UnitID ?? '',
            'parameters.$.key': '',
            'parameters.$.sequence_number': element?.SequenceNo ?? '',
            'parameters.$.Number_of_bytes': element?.noOfByte ?? '',

            'parameters.$.holding_register_number':
              element?.HoldingRegisterNo ?? '',
            'parameters.$.starting_register': element?.StartingRegister ?? '',
            'parameters.$.function_value': element?.FunctionValue ?? '',
            'parameters.$.min_std_value': element?.MinStdValue ?? '',
            'parameters.$.max_std_value': element?.MaxStdValue ?? '',
            'parameters.$.multiplication_factor':
              element?.MultiplicationFactor ?? '',
            'parameters.$.conversion_type': element?.ConversionType ?? '',
            'parameters.$.constant_value_420': element?.ConstantValue420 ?? 0,
            'parameters.$.range_420': element?.Range ?? 0,
            'parameters.$.constant_subtraction_420': 0,
            'parameters.$.to_pcb': element?.ToPCB ?? '',
            'parameters.$.byte_reading_order': element?.ByteReadingOrder ?? '',
            'parameters.$.min_vaild_value': element?.MinValidValue ?? '',
            'parameters.$.max_valid_value': element?.MaxValidValue ?? '',
            'parameters.$.z_data': '0',
            'parameters.$.status': 'true',
            'parameters.$.parameter_status': 'true',
            'parameters.$.device_status': 'true',
            'parameters.$.client_status': 'true',
            'parameters.$.to_cpcb':
              element?.ToCPCB === 'yes' ? 'true' : 'false',
            'parameters.$.two_way_communication': 'true',
          },
        }
      );
      // console.log(`${element?.IndustryName}__${element?.DeviceName}__${element?.ParamNameCustom}__${element?.StationName}`);
      console.log(resp);
    }
  */
