const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
dotenv.config();

const app = require('./app');

const { getDb } = require('./db.js');

mongoose
  .connect(getDb(), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then(() => {
    console.log('db sucess');
  })
  .catch((error) => {
    console.log(error.message);
  });

var httpServer = http.createServer(app);

httpServer.listen(8000);
