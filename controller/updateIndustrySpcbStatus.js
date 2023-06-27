const PcbLogs = require("../Models/pcbLogsModel");
const Industries = require("../Models/industriesModel");

exports.updateIndustrySpcbStatus = async (req, response) => {
  Industries.find()
    .select("industry_name status_SPCB -_id")
    .then((res) => {
      res.forEach(async (item) => {
        try {
          const lastDataObj = await PcbLogs.findOne({
            industry_name: item.industry_name,
            send: true,
            board: { $ne: "CPCB" },
          }).sort({ _id: -1 });
          if (lastDataObj) {
            const delayDuration = 4 * 60 * 60 * 1000;
            const offlineDuration = 2 * 24 * 60 * 60 * 1000;
            const d = new Date();
            const currTime = d.getTime();
            const lastDataTime = lastDataObj.createdAt;
            const lastDataRecivedDuration = currTime - lastDataTime;
            if (
              item.status_SPCB !== "online" &&
              item.status_SPCB !== "offline" &&
              item.status_SPCB !== "delay"
            ) {
              if (item.status_SPCB === "" || item.status_SPCB === " ") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_SPCB: "offline",
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
            } else if (lastDataRecivedDuration < delayDuration) {
              if (
                item.status_SPCB === "delay" ||
                item.status_SPCB === "offline"
              ) {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_SPCB: "online",
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
              if (item.status_SPCB === "delay") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_SPCB: "offline",
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
              if (item.status_SPCB === "online") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_SPCB: "delay",
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
            }
          } else if (
            !lastDataObj &&
            item.status_SPCB !== "maintainance" &&
            item.status_SPCB !== "shutdown" &&
            item.status_SPCB !== "seasonal_shutdown" &&
            item.status_SPCB !== "closed_by_cpcb"
          ) {
            if (item.status_SPCB === "online" || item.status_SPCB === "delay") {
              try {
                await Industries.findOneAndUpdate(
                  { industry_name: item.industry_name },
                  {
                    status_SPCB: "offline",
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
          } else if (item.status_SPCB === "" || item.status_SPCB === " ") {
            try {
              await Industries.findOneAndUpdate(
                { industry_name: item.industry_name },
                {
                  status_SPCB: "offline",
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
          } else if (item.status_SPCB === "online" && !lastDataObj) {
            try {
              await Industries.findOneAndUpdate(
                { industry_name: item.industry_name },
                {
                  status_SPCB: "offline",
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
        } catch (error) {}
      });

      response.status(200).json({
        status: "Success",
        message: "updated industries spcb status",
      });
    })
    .catch((error) => {
      response.status(200).json({
        status: "Failed",
        message: error.message,
      });
    });
};
