'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
// const scheduler = require('./scheduler/index').getInstance();
// const { connectClientWS } = require('./config/websocket');
// const mqttConfig = require('./config/mqtt');

// connectClientWS();
// scheduler.getSCID();
const PORT = process.env.PORT;
const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));
// mqttConfig.mqttForCreateLoker();

module.exports = server;