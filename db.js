const dotenv = require('dotenv');
dotenv.config();

exports.getDb = () => process.env.DATABASE;
