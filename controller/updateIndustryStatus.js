const RawData = require("../Models/rawData");
const Industries = require("../Models/industriesModel");
const Inactives = require("../Models/inactivesModel");
const Alert = require("../Models/alertsModel");

const sendMessage = async (
  message,
  phone,
  alert_type,
  industry_name,
  device_name
) => {
  // const accountSid = 'AC270dcbb3db89e204580359b0f1c04a0f';
  // const authToken = '6bcdd27587f56bb59b4e1fc96e39c18b';

  // const client = require('twilio')(accountSid, authToken);
  // client.messages
  //   .create({
  //     body: message,
  //     from: '+19106065003',
  //     to: `+91${phone}`,
  //   })
  //   .then((message) => {
  await Alert.create({
    industry_name,
    device_name,
    alert_type,
    body: message,
    createdAt: new Date().getTime(),
  }).catch((error) => {
    console.log(error.message);
  });
  // })
  // .catch((error) => {
  //   console.log(error.message);
  // });
};

exports.updateIndustryStatus = async (req, response) => {
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
        device_name: "$devices.device_name",
      },
    },
  ]);

  await Inactives.findOneAndUpdate(
    { _id: "6495778340d94e4fb0b52c35" },
    { $push: { data: { data: industriesInactive } } }
  );

  Industries.aggregate([
    {
      $unwind: "$devices",
    },
    {
      $project: {
        industry_name: "$industry_name",
        location_name: "$location_name",
        phone: "$phone_number",
        device_name: "$devices.device_name",
        status: "$devices.status",
      },
    },
  ])
    .then((res) => {
      res.forEach(async (item) => {
        try {
          const lastDataObj = await RawData.findOne({
            device_name: item.device_name,
          }).sort({ _id: -1 });
          if (lastDataObj) {
            const inactiveDuration = 0.167 * 60 * 60 * 1000;
            const delayDuration = 4 * 60 * 60 * 1000;
            const offlineDuration = 2 * 24 * 60 * 60 * 1000;
            const d = new Date();
            const currTime = d.getTime();
            const lastDataTime = new Date(lastDataObj.created_at).getTime();
            const lastDataRecivedDuration = currTime - lastDataTime;
            if (
              item.status !== "online" &&
              item.status !== "offline" &&
              item.status !== "delay" &&
              item.status !== "inactive"
            ) {
              if (item.status === "" || item.status === " ") {
                calculatedStatus = "offline";

                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      $set: {
                        "devices.$.status": "offline",
                      },
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                } catch (error) {
                  console.log(error.message);
                }
              } else {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      $set: {
                        "devices.$.status": item.status,
                      },
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                } catch (error) {
                  console.log(error.message);
                }
              }
            } else if (lastDataRecivedDuration > offlineDuration) {
              if (item.status === "delay") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      $set: {
                        "devices.$.status": "offline",
                        $push: {
                          "devices.$.offline_status_record": {
                            from: lastDataTime,
                            to: currTime,
                          },
                        },
                      },
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                  sendMessage(
                    `SMS ALERT FROM SURVEYKSHAN Industry : ${item.industry_name}, Location : ${item.location_name}, Station Name : n/a, Status : Offline, Last Data Received : n/a Respond at info@e2i.co.in Team Envirozone Equipments & Instruments`,
                    item.phone.split(",")[0],
                    "offline",
                    item.industry_name,
                    item.device_name
                  );
                } catch (error) {
                  console.log(error.message);
                }
              } else if (item.status !== "offline") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      "devices.$.status": "offline",
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                } catch (error) {
                  console.log(error.message);
                }
              }
            } else if (lastDataRecivedDuration > delayDuration) {
              if (item.status === "inactive") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      $set: {
                        "devices.$.status": "delay",
                        $push: {
                          "devices.$.delay_status_record": {
                            from: lastDataTime,
                            to: currTime,
                          },
                        },
                      },
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});

                  sendMessage(
                    `SMS ALERT FROM SURVEYKSHAN Industry : ${item.industry_name}, Location : ${item.location_name}, Station Name : n/a, Status : Delay, Last Data Received : n/a Respond at info@e2i.co.in Team Envirozone Equipments & Instruments`,
                    item.phone.split(",")[0],
                    "delay",
                    item.industry_name,
                    item.device_name
                  );
                } catch (error) {
                  console.log(error.message);
                }
              } else if (item.status !== "delay") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      "devices.$.status": "delay",
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                } catch (error) {
                  console.log(error.message);
                }
              }
            } else if (lastDataRecivedDuration > inactiveDuration) {
              if (item.status === "online") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      $set: {
                        "devices.$.status": "inactive",
                        // $push: {
                        //   'devices.$.delay_status_record': {
                        //     from: lastDataTime,
                        //     to: currTime,
                        //   },
                        // },
                      },
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});

                  sendMessage(
                    `SMS ALERT FROM SURVEYKSHAN Industry : ${item.industry_name}, Location : ${item.location_name}, Station Name : n/a, Status : Inactive, Last Data Received : n/a Respond at info@e2i.co.in Team Envirozone Equipments & Instruments`,
                    item.phone.split(",")[0],
                    "inactive",
                    item.industry_name,
                    item.device_name
                  );
                } catch (error) {
                  console.log(error.message);
                }
              } else if (item.status !== "inactive") {
                try {
                  await Industries.findOneAndUpdate(
                    { "devices.device_name": item.device_name },
                    {
                      "devices.$.status": "inactive",
                    },
                    {
                      new: true,
                      runValidators: true,
                    }
                  )
                    .then((res) => {})
                    .catch((err) => {});
                } catch (error) {
                  console.log(error.message);
                }
              }
            } else {
              try {
                await Industries.findOneAndUpdate(
                  { "devices.device_name": item.device_name },
                  {
                    "devices.$.status": "online",
                  },
                  {
                    new: true,
                    runValidators: true,
                  }
                )
                  .then((res) => {})
                  .catch((err) => {});
              } catch (error) {
                console.log(error.message);
              }
            }
          } else if (
            !lastDataObj &&
            item.status !== "maintainance" &&
            item.status !== "shutdown" &&
            item.status !== "seasonal_shutdown" &&
            item.status !== "closed_by_cpcb"
          ) {
            if (
              item.status === "online" ||
              item.status === "delay" ||
              item.status === "inactive"
            ) {
              try {
                await Industries.findOneAndUpdate(
                  { "devices.device_name": item.device_name },
                  {
                    "devices.$.status": "offline",
                  },
                  {
                    new: true,
                    runValidators: true,
                  }
                )
                  .then((res) => {})
                  .catch((err) => {});
              } catch (error) {
                console.log(error.message);
              }
            }
          } else if (item.status === "" || item.status === " ") {
            try {
              await Industries.findOneAndUpdate(
                { "devices.device_name": item.device_name },
                {
                  "devices.$.status": "offline",
                },
                {
                  new: true,
                  runValidators: true,
                }
              )
                .then((res) => {})
                .catch((err) => {});
            } catch (error) {
              console.log(error.message);
            }
          } else if (item.status === "online" && !lastDataObj) {
            try {
              await Industries.findOneAndUpdate(
                { "devices.device_name": item.device_name },
                {
                  "devices.$.status": "offline",
                },
                {
                  new: true,
                  runValidators: true,
                }
              )
                .then((res) => {})
                .catch((err) => {});
            } catch (error) {
              console.log(error.message);
            }
          }
        } catch (error) {
          console.log(error.message);
        }
      });

      response.status(200).json({
        status: "Success",
        message: "updated industry status",
      });
    })
    .catch((error) => {
      response.status(200).json({
        status: "Failed",
        message: error.message,
      });
    });
};
