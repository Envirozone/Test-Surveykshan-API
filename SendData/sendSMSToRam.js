const RawData = require('../Models/rawData');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const { getDb } = require('./../db.js');

dotenv.config();

const accountSid = 'AC270dcbb3db89e204580359b0f1c04a0f';
const authToken = '6bcdd27587f56bb59b4e1fc96e39c18b';

mongoose
  .connect(getDb(), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then(() => {
    setInterval(function () {
      RawData.findOne({
        device_name: 'M00542',
      })
        .sort({ _id: -1 })
        .then((resp) => {
          const d = new Date();
          const currTime = d.getTime();
          const lastDataTime = new Date(resp.created_at).getTime();
          const lastDataRecivedDuration = currTime - lastDataTime;

          if (lastDataRecivedDuration > 1000 * 60 * 30) {
            const message = 'Server band hai 30min se!!!';
            const messageStr = `${message}\n${message}`;
            const client = require('twilio')(accountSid, authToken);
            client.messages
              .create({
                body: messageStr,
                from: '+19106065003',
                to: '+917505315102',
              })
              .then((message) => console.log(message.sid))
              .catch((error) => {
                console.log(error.message);
              });
          }
        }).catch(error=>{
            console.log(error.message)
        })
    }, 1000 * 60 * 10);
  })
  .catch((error) => {
    console.log(error.message);
  });
