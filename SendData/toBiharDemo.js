const axios = require("axios");

function genRand(min, max, decimalPlaces) {
  var rand = Math.random() * (max - min) + min;
  var power = Math.pow(10, decimalPlaces);
  return Math.floor(rand * power) / power;
}

const setDataTOBCB = function (industryID, stationID, deviceID) {
  axios({
    method: "post",
    url: `http://bpcbcems.nic.in/bpcpcb-api/api/industry/${industryID}/station/${stationID}/data`,
    data: [
      {
        deviceId: deviceID,
        params: [
          {
            parameter: "PM",
            value: genRand(35,45,2),
            unit: "mg/Nm3",
            timestamp: new Date().getTime(),
            flag: "U",
          },
        ],
      },
    ],
    headers: {
      Authorization: `Basic MTQwOTIwMjJfZW1wb3dlcl9kYXRhbHl6ZXJzX3NvbHV0aW9uc18xNDA3MDc=`,
    },
  })
    .then((res) => {
      console.log({ [industryID]: res.data });
    })
    .catch((error) => {
      console.log("error");
      console.log(error);
    });
};

setInterval(function () {
    setDataTOBCB("SKID_362","Stack_1_Furnace","SK_343_01");
}, 1000 * 60 * 5);
