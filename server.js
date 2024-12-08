'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
// const { connectClientWS } = require('./config/websocket');
const { getClientSocket } = require('./config/baru');
// const mqttConfig = require('./config/mqtt');

// connectClientWS();
getClientSocket();
const PORT = process.env.PORT;
const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));
// mqttConfig.mqttForCreateLoker();

module.exports = server;