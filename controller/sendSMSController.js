const Industries = require("../Models/industriesModel");

exports.sendInactiveSMSToPiyush = async (req, res) => {
  try {
    const industriesInactive = await Industries.aggregate([
      {
        $unwind: "$devices",
      },
      {
        $match: {
          "devices.status": "inactive",
        },
      },
      {
        $project: {
          status: "$devices.status",
        },
      },
    ]);

    if (industriesInactive.length > 50) {
      const accountSid = "AC2cde71877b1f68fbe73cceae408b5199";
      const authToken = "a9cb4eafe117ff72135cefc5d971796d";
      const message = `ALERT ALERT!!! \n\nInactive Industries ${industriesInactive.length}`;
      const client = require("twilio")(accountSid, authToken);

      client.messages
        .create({
          body: message,
          from: "+14847491821",
          to: "+919871888359",
        })
        .then((message) => {
          res.status(200).json({
            status: "Success",
            message: "SMS Successfully send",
            smsId: message.sid,
          });
        })
        .catch((error) => {
          res.status(404).json({
            status: "Failed",
            message: error.message,
          });
        });
    } else {
      res.status(200).json({
        status: "Success",
        message: "SMS not send",
        smsId: "n/a",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};
