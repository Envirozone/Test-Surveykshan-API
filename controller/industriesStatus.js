const Industries = require('../Models/industriesModel');

exports.updateIndustriesStatusManually = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });
    let industryDataDulpicate = industryData;
    let demo = [];
    industryDataDulpicate.devices.forEach((device) => {
      if (String(device._id) === req.params.device_id) {
        demo.push({ ...device._doc, status: req.params.industry_status });
      } else {
        demo.push({ ...device._doc });
      }
    });
    industryDataDulpicate.devices = demo;

    const industry = await Industries.findByIdAndUpdate(
      { _id: req.params.industry_id },
      industryDataDulpicate,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(201).json({
      status: 'Updated',
      data: {
        industry,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getIndustriesStatus = async (req, res) => {
  try {
    const allIndustries = await Industries.find(req.query)
      .select(
        'industry_name latitude longitude devices.status show_to_CPCB show_to_PCB status_CPCB status_SPCB devices.device_name devices._id'
      )
      .exec();
    const data = await [];
    let totalIndustry = 0;
    let totalIndustryOnCpcb = 0;
    let totalIndustryOnSpcb = 0;
    let totalDevice = 0;
    let totalDeviceOnCpcb = 0;
    let totalDeviceOnSpcb = 0;
    let allCounts = {};
    let allCountsCpcb = {};
    let allCountsSpcb = {};

    for (let i = 0; i < allIndustries.length; i++) {
      const industry = allIndustries[i];
      totalIndustry = totalIndustry + 1;
      if (industry.show_to_CPCB === 'true') {
        totalIndustryOnCpcb = totalIndustryOnCpcb + 1;
        allCountsCpcb[industry.status_CPCB]
          ? (allCountsCpcb[industry.status_CPCB] =
              allCountsCpcb[industry.status_CPCB] + 1)
          : (allCountsCpcb[industry.status_CPCB] = 1);
      }
      if (industry.show_to_PCB === 'true') {
        totalIndustryOnSpcb = totalIndustryOnSpcb + 1;
        allCountsSpcb[industry.status_SPCB]
          ? (allCountsSpcb[industry.status_SPCB] =
              allCountsSpcb[industry.status_SPCB] + 1)
          : (allCountsSpcb[industry.status_SPCB] = 1);
      }
      for (let j = 0; j < industry.devices.length; j++) {
        const device = industry.devices[j];

        totalDevice = totalDevice + 1;

        allCounts[device.status]
          ? (allCounts[device.status] = allCounts[device.status] + 1)
          : (allCounts[device.status] = 1);

        const obj = {
          id: device._id,
          name: `${industry.industry_name} (${device.device_name})`,
          position: {
            lat: Number(industry.latitude),
            lng: Number(industry.longitude),
          },
          industry_state: device.status,
          to_cpcb: industry.show_to_CPCB,
          to_pcb: industry.show_to_PCB,
        };
        data.push(obj);
      }
    }

    res.status(200).json({
      status: 'success',
      total_industries: totalIndustry,
      total_industries_cpcb: totalIndustryOnCpcb,
      total_industries_spcb: totalIndustryOnSpcb,
      total_devices: totalDevice,
      total_devices_cpcb: totalDeviceOnCpcb,
      total_devices_spcb: totalDeviceOnSpcb,
      more_data: allCounts,
      more_data_cpcb: allCountsCpcb,
      more_data_spcb: allCountsSpcb,
      results: data,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getIndustriesStatusByIndustryId = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });

    const industryDataArr = [];
    industryDataArr.push(industryData);

    const data = await [];
    let totalIndustry = 0;
    let totalDevice = 0;
    let allCounts = {};

    for (let i = 0; i < industryDataArr.length; i++) {
      totalIndustry = totalIndustry + 1;
      const industry = industryDataArr[i];
      for (let j = 0; j < industry.devices.length; j++) {
        const device = industry.devices[j];

        totalDevice = totalDevice + 1;

        allCounts[device.status]
          ? (allCounts[device.status] = allCounts[device.status] + 1)
          : (allCounts[device.status] = 1);

        const obj = {
          id: device._id,
          name: `${industry.industry_name} (${device.device_name})`,
          position: {
            lat: Number(industry.latitude),
            lng: Number(industry.longitude),
          },
          industry_state: device.status,
        };
        data.push(obj);
      }
    }

    res.status(200).json({
      status: 'success',
      total_industries: totalIndustry,
      total_devices: totalDevice,
      more_data: allCounts,
      results: data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getIndustriesStatusReport = async (req, res) => {
  try {
    const searchStr = req.query.searchStr;
    const queryObj = {};
    Object.entries(req.query).forEach((item) => {
      const [key, value] = item;
      if (value !== '' && key !== 'searchStr') {
        queryObj[key] = value;
      }
    });
    
    try {
      const allIndustries = await Industries.find({
        $or: [
          { device_name: { $regex: new RegExp(searchStr), $options: 'i' } },
          { industry_name: { $regex: new RegExp(searchStr), $options: 'i' } },
        ],
        ...queryObj,
      }).select(
        'industry_name status_CPCB status_SPCB address city state pincode latitude longitude ganga_basin devices.status devices.last_data_recived devices.live_since devices._id devices.device_name devices.device_category devices.offline_status_record devices.delay_status_record'
      );

      const data = [];
      allIndustries.forEach(
        ({
          _id,
          industry_name,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          ganga_basin,
          devices,
          status_CPCB,
          status_SPCB,
        }) => {
          if (devices.length > 0) {
            const industry_id = _id;
            devices.forEach(
              ({
                status,
                last_data_recived,
                live_since,
                _id,
                device_name,
                device_category,
                offline_status_record,
                delay_status_record,
              }) => {
                data.push({
                  id: _id,
                  industry_id,
                  industry_name: industry_name,
                  device_name: device_name,
                  device_category: device_category,
                  industry_status: status,
                  live_since: live_since,
                  last_data_recived: last_data_recived,
                  status_CPCB,
                  status_SPCB,
                  address: address,
                  city: city,
                  state: state,
                  pincode: pincode,
                  latitude: latitude,
                  longitude: longitude,
                  ganga_basin: ganga_basin,
                  offline_count: offline_status_record?.length || 0,
                  offline_data: offline_status_record,
                  delay_count: delay_status_record?.length || 0,
                  delay_data: delay_status_record,
                });
              }
            );
          }
        }
      );

      res.status(200).json({
        status: 'success',
        results: data,
      });
    } catch (error) {
      res.status(400).json({
        status: 'Failed',
        message: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
