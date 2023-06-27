const Parameters = require('../Models/parametersModel');

exports.getParameters = async (req, res) => {
  try {
    const parameters = await Parameters.find(req.query);
    res.status(200).json({
      status: 'success',
      results: parameters.length,
      data: {
        parameters,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getParameter = async (req, res) => {
  try {
    const parameter = await Parameters.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        parameter,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addParameter = async (req, res) => {
  try {
    const doc = await Parameters.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        parameter: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updateParameter = async (req, res) => {
  try {
    const parameter = await Parameters.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(204).json({
      status: 'success',
      data: {
        parameter,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deleteParameter = async (req, res) => {
  try {
    await Parameters.findOneAndDelete({ _id: req.params.id });

    res.status(204).json({
      status: 'successfully deleted',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
