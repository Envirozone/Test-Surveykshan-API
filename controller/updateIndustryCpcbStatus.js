const PcbLogs = require("../Models/pcbLogsModel");
const Industries = require("../Models/industriesModel");

exports.updateIndustryCpcbStatus = async (req, response) => {
  Industries.find()
    .select("industry_name status_CPCB -_id")
    .then((res) => {
      res.forEach(async (item) => {
        try {
          const lastDataObj = await PcbLogs.findOne({
            industry_name: item.industry_name,
            send: true,
            board: "CPCB",
          }).sort({ _id: -1 });
          if (lastDataObj) {
            const delayDuration = 4 * 60 * 60 * 1000;
            const offlineDuration = 2 * 24 * 60 * 60 * 1000;
            const d = new Date();
            const currTime = d.getTime();
            const lastDataTime = lastDataObj.createdAt;
            const lastDataRecivedDuration = currTime - lastDataTime;
            if (
              item.status_CPCB !== "online" &&
              item.status_CPCB !== "offline" &&
              item.status_CPCB !== "delay"
            ) {
              if (item.status_CPCB === "" || item.status_CPCB === " ") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_CPCB: "offline",
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
                item.status_CPCB === "delay" ||
                item.status_CPCB === "offline"
              ) {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_CPCB: "online",
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
              if (item.status_CPCB === "delay") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_CPCB: "offline",
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
              if (item.status_CPCB === "online") {
                try {
                  await Industries.findOneAndUpdate(
                    { industry_name: item.industry_name },
                    {
                      status_CPCB: "delay",
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
                  { industry_name: item.industry_name },
                  {
                    status_CPCB: "online",
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
            item.status_CPCB !== "maintainance" &&
            item.status_CPCB !== "shutdown" &&
            item.status_CPCB !== "seasonal_shutdown" &&
            item.status_CPCB !== "closed_by_cpcb"
          ) {
            if (item.status_CPCB === "online" || item.status_CPCB === "delay") {
              try {
                await Industries.findOneAndUpdate(
                  { industry_name: item.industry_name },
                  {
                    status_CPCB: "offline",
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
          } else if (item.status_CPCB === "" || item.status_CPCB === " ") {
            try {
              await Industries.findOneAndUpdate(
                { industry_name: item.industry_name },
                {
                  status_CPCB: "offline",
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
          } else if (item.status_CPCB === "online" && !lastDataObj) {
            try {
              await Industries.findOneAndUpdate(
                { industry_name: item.industry_name },
                {
                  status_CPCB: "offline",
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
        message: "updated industries spcb status",
      });
    })
    .catch((err) => {
      response.status(200).json({
        status: "Failed",
        message: error.message,
      });
    });
};
