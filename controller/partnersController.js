const Partner = require('../Models/partnerModel');
const Industries = require('../Models/industriesModel');
const User = require('../Models/userModel');

exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find(req.query);
    res.status(200).json({
      status: 'success',
      results: partners.length,
      data: {
        partners,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        partner,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.addPartner = async (req, res) => {
  try {
    const doc = await Partner.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        partner: doc,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    try {
      Partner.findById({ _id: req.params.id }).then((resp) => {
        Industries.updateMany(
          { industry_partner: resp.partner_name },
          { industry_partner: req.body.partner_name }
        );
        User.updateOne(
          { username: resp.partner_name },
          { username: req.body.partner_name }
        );
      });
    } catch (error) {
      console.log(error.message);
    }

    const partner = await Partner.findByIdAndUpdate(
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
        partner,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.deletePartner = async (req, res) => {
  try {
    await Partner.findOneAndDelete({ _id: req.params.id });

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
