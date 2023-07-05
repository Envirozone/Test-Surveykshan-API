const axios = require("axios");

setInterval(async () => {
  try {
    await axios({
      url: `http://localhost:8080/api/v1/update/industry_status`,
    });
  } catch (error) {}

  try {
    await axios({
      url: `http://localhost:8080/api/v1/send_sms/piyush/inactive_50`,
    });
  } catch (error) {}
}, 1000 * 60 * 2);

setInterval(async () => {
  try {
    await axios({
      url: `http://localhost:8080/api/v1/update/spcb_status`,
    });
  } catch (error) {}

  try {
    await axios({
      url: `http://localhost:8080/api/v1/update/cpcb_status`,
    });
  } catch (error) {}
}, 1000 * 60 * 5 + 50);
