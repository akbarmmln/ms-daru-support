'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrLoketAvail = require('../../../model/adr_loket_tersedia');

async function runNanoID(n) {
  const { customAlphabet } = await import('nanoid');
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
  const id = customAlphabet(alphabet, n);
  return id();
}

exports.createLoket = async function (req, res) {
  try {
    const jumlah_counter = req.body.jumlah_counter;
    const num_counter = parseInt(jumlah_counter);

    for (let i = 1; i < num_counter; i++) {
      let jenis_id = await runNanoID(5);
      let topic = `loket-${jenis_id}`;
      (function (i) {
        try {
          const qos = 0;
          const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8);

          let payloadCreate = {
            id: uuidv4(),
            created_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
            created_by: req.id,
            is_deleted: 0,
            nama_loket: topic,
            client_topic: topic,
            client_id: clientId
          }
  
          const client = mqtt.connect(process.env.HOST_MQTT, {
            ca: [process.env.CA_CERT_MQTT.replace(/\\n/gm, '\n')],
            username: process.env.USR_MQTT,
            password: process.env.PASS_MQTT,
            clientId: clientId
          });

          client.on("connect", function (connack) {
            logger.infoWithContext(`client connected to ${topic}, ${JSON.stringify(connack)}`);
  
            client.subscribe(topic, { qos }, (error) => {
              if (error) {
                logger.errorWithContext({ error: error, message: `subscribe error to topic ${topic}` });
                return;
              }

              adrLoketAvail.create(payloadCreate);
              logger.infoWithContext(`Subscribe success to topic ${topic}`);
            });
          });
  
          client.on("error", function (err) {
            logger.errorWithContext({ error: err, message: `Error occurs in topic ${topic}` });
            if (err.code == "ENOTFOUND") {
              logger.infoWithContext(`Network error, make sure you have an active internet connection in topic ${topic}`);
            }
          });
  
          client.on("close", function () {
            logger.infoWithContext(`Connection closed by client in topic ${topic}`);
          });
  
          client.on("reconnect", function () {
            logger.infoWithContext(`Client trying a reconnection in topic ${topic}`);
          });
  
          client.on("offline", function () {
            logger.infoWithContext(`Client is currently offline in topic ${topic}`);
          });
  
          client.on('message', function (receivedTopic, message, packet) {
            try {
              let a = packet.payload.toString();
              let b = JSON.parse(a);
              logger.infoWithContext(`packet received for topic ${receivedTopic}, ${a}`);
              logger.infoWithContext(`packet received for topic ${receivedTopic} in json , ${JSON.stringify(b)}`);
              logger.infoWithContext(`message received for topic ${message}`);
            } catch (e) {
              logger.errorWithContext({ error: e, message: `error on message received parsing for topic ${receivedTopic}` });
            }
          });
  
          client.on("packetsend", function (packet) {
            logger.infoWithContext(`packet sent for topic ${topic}, ${packet}`);
          });
        } catch (e) {
          logger.errorWithContext({ error: e, message: `looping occurs error in topic ${topic}` });
        }
      })(i);
    }
    return res.status(200).json(rsmg('000000'));
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation//input/cek-file...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation//input/cek-file...', e);
  }
}