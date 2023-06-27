const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());

const bodyParser = require('body-parser');
const CsvUpload = require('express-fileupload');

app.use(CsvUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const industriesRouter = require('./routes/industriesRoutes');
const userRouter = require('./routes/userRoutes');
const allIndustryNames = require('./routes/allIndustryNamesRoutes');
const allUserNames = require('./routes/allUserNamesRoutes');
const industryCategoriesRoutes = require('./routes/industryCategoriesRoutes');
const industryTypesRoutes = require('./routes/industryTypesRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const deviceCategoriesRoutes = require('./routes/deviceCategoriesRoutes');
const deviceManufacturersRoutes = require('./routes/deviceManufacturersRoutes');
const deviceSuppliersRoutes = require('./routes/deviceSuppliersRoutes');
const parametersRoutes = require('./routes/parametersRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const rawDataRoutes = require('./routes/rawDataRoutes');
const dataSettingRoutes = require('./routes/dataSettingRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const deviceDataRoutes = require('./routes/deviceDataRoutes');
const industriesStatusRoutes = require('./routes/industriesStatusRoutes');
const pcbLogsRoutes = require('./routes/pcbLogsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const sendDataRoutes = require('./routes/sendDataRoutes');
const updateStatusRoutes = require('./routes/updateStatusRoutes');
const sendSMSRoutes = require('./routes/sendSMSRoutes');

//Middlewares
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/industries', industriesRouter);
app.use('/api/v1/industry_names', allIndustryNames);
app.use('/api/v1/user_names', allUserNames);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/industry_categories', industryCategoriesRoutes);
app.use('/api/v1/industry_types', industryTypesRoutes);
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/device_categories', deviceCategoriesRoutes);
app.use('/api/v1/device_manufacturers', deviceManufacturersRoutes);
app.use('/api/v1/device_suppliers', deviceSuppliersRoutes);
app.use('/api/v1/parameters', parametersRoutes);
app.use('/api/v1/partner', partnerRoutes);
app.use('/api/v1/rawdata', rawDataRoutes);
app.use('/api/v1/data_setting', dataSettingRoutes);
app.use('/api/v1/camera', cameraRoutes);
app.use('/api/v1/device_data', deviceDataRoutes);
app.use('/api/v1/industries_status', industriesStatusRoutes);
app.use('/api/v1/pcb_logs', pcbLogsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/send_data', sendDataRoutes);
app.use('/api/v1/update', updateStatusRoutes);
app.use('/api/v1/send_sms', sendSMSRoutes);

//server
module.exports = app;
