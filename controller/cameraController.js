const Industries = require('../Models/industriesModel');

exports.getAllCamerasData = async (req, res) => {
  try {
    const industriesData = await Industries.find();
    const industryDataDulpicate = industriesData;
    const demo = [];
    industryDataDulpicate.forEach((industry) => {
      industry.cameras.forEach((camera) => {
        obj = {
          ...camera._doc,
          camera_id: camera._id,
          indutry_id: industry._id,
          industry_name: industry.industry_name,
        };
        delete obj._id;
        demo.push(obj);
      });
    });
    res.status(200).json({
      status: 'Success',
      data: {
        cameras: demo,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Success',
      message: error.message,
    });
  }
};

exports.getAllCamerasByIndustryId = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        cameras: industryData.cameras,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Success',
      message: error.message,
    });
  }
};

exports.getCameraByIndustryIDAndDeviceID = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });
    const industryDataDulpicate = industryData;
    const arr = industryDataDulpicate.cameras.filter((camera) => {
      return String(camera._id) === req.params.camera_id;
    });
    if (arr.length === 1) {
      res.status(200).json({
        status: 'Success',
        data: {
          camera: arr[0],
        },
      });
    } else {
      res.status(404).json({
        status: 'Failed',
        message: 'no data',
      });
    }
  } catch (error) {
    res.status(404).json({
      status: 'Success',
      message: error.message,
    });
  }
};

exports.addNewCamera = async (req, res) => {
  const industry = await Industries.findByIdAndUpdate(
    { _id: req.params.industry_id },
    {
      $push: {
        cameras: {
          ...req.body,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    status: 'success',
  });
};

exports.updateCamera = async (req, res) => {
  try {
    const industryData = await Industries.findById({
      _id: req.params.industry_id,
    });

    let industryDataDulpicate = industryData;
    let demo = [];
    industryDataDulpicate.cameras.forEach((camera) => {
      if (String(camera._id) === req.params.camera_id) {
        demo.push({ ...camera._doc, ...req.body });
      } else {
        demo.push({ ...camera._doc });
      }
    });
    industryDataDulpicate.cameras = demo;

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

exports.deleteCamera = async (req, res) => {
  try {
    const industryData = await Industries.findById(req.params.industry_id);
    let industryDuplicate = industryData;
    const newCameras = industryDuplicate.cameras.filter((camera) => {
      return String(camera._id) !== req.params.camera_id;
    });
    industryDuplicate.cameras = newCameras;

    const industry = await Industries.findByIdAndUpdate(
      { _id: req.params.industry_id },
      industryDuplicate,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(201).json({
      status: 'Deleted',
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
