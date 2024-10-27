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
const redis = require('../../../config/redis');
const mqtt = require('../../../config/mqtt');

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
    const clientId = 'mqtt_antiran';

    let pushTopic = [];
    let pushSaveData = [];

    for (let i = 1; i <= num_counter; i++) {
      try {
        let id = await runNanoID(5);
        let topic = `loket-${id}`;  
        let payloadCreate = {
          id: uuidv4(),
          created_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
          created_by: req.id,
          is_deleted: 0,
          nama_loket: topic,
          client_topic: topic,
          client_id: clientId
        }
        pushTopic.push(topic);
        pushSaveData.push(payloadCreate)
      } catch (e) {
        logger.errorWithContext({ error: e, message: `looping occurs error in topic created` });
        continue;
      }
    }

    await mqtt.createMqttConnection(clientId);
    await mqtt.addSubscription(clientId, pushTopic, pushSaveData);
    
    return res.status(200).json(rsmg('000000', pushSaveData));
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/mqtt/create-loket...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/mqtt/create-loket...', e);
  }
}

exports.removeLoket = async function (req, res) {
  try {
    const client_id = req.body.client_id;
    const matchedClient = clientDatas.find(item => item.clientId === client_id);
    if (!formats.isEmpty(matchedClient?.clientId)) {
      const details = await adrLoketAvail.findOne({
        raw: true,
        where: {
          client_id: client_id
        }
      })

      if (details && details.is_deleted !== 1) {
        const client = matchedClient.clientConnect;
        await endClientMqtt(client);
        await adrLoketAvail.update({
          is_deleted: 1
        }, {
          where: {
            id: details.id
          }
        })
      } else {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80007');
      }
    } else {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80007');
    }
    return res.status(200).json(rsmg('000000', matchedClient.clientId))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/mqtt/remove-loket...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/mqtt/remove-loket...', e);
  }
}

function endClientMqtt(client) {
  return new Promise((resolve, reject) => {
    client.end(false, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

const mqtts = require('mqtt');
exports.get = async function(req, res) {
  try{
    // const client = mqtts.connect(process.env.HOST_MQTT, {
    //   ca: [process.env.CA_CERT_MQTT.replace(/\\n/gm, '\n')],
    //   username: process.env.USR_MQTT,
    //   password: process.env.PASS_MQTT,
    //   clientId: '123'
    // });

    const options = {
      host: process.env.HOST_MQTT_NEW,
      port: '8883',
      protocol: 'mqtts',
      username: process.env.USR_MQTT,
      password: process.env.PASS_MQTT,
      ca: [process.env.CA_CERT_MQTT_NEW.replace(/\\n/gm, '\n')],
      clientId: "123"
    }

    // const options = {
    //   host: 'bea519f3.ala.us-east-1.emqxsl.com',
    //   port: '8883',
    //   protocol: 'mqtts',
    //   username: 'allforyu',
    //   password: 'Akbarakbar@99',
    //   ca: [process.env.CA_CERT_MQTT.replace(/\\n/gm, '\n')],
    //   clientId: '123'
    // }

    const client = mqtts.connect(options);
    const qos = 0;

    console.log('sadasdasd', client)
    console.log('hahahahha', typeof client);

    client.on('connect', () => {
      logger.infoWithContext(`Client connected`);
      client.subscribe('newTopics', { qos }, (err, granted) => {
        if (err) {
          logger.errorWithContext({ error: err, message: `subscribe error to topic` })
        } else {
          logger.infoWithContext(`Subscribe success to topic ${granted}`)
        }
      });
    });

    client.on("error", function (err) {
      console.log("Error: " + err)
      if (err.code == "ENOTFOUND") {
        console.log("Network error, make sure you have an active internet connection")
      }
    })

    client.on('message', (receivedTopic, message, packet) => {
      const packets = packet.payload.toString();
      logger.infoWithContext(`Received message from topic ${receivedTopic}: ${packets}`);
    });
  
    return res.status(200).json(rsmg('000000'))
  }catch(e){
    logger.errorWithContext({ error: e, message: 'error' });
    return utils.returnErrorFunction(res, 'error', e);
  }
}

exports.end = async function(req, res) {
  try{
    const a = await redis.get('key1');
    a.end(false, (error) => {
      if (error) {
        console.log('gagal', error)
      } else {
        console.log('sukses')
      }
    });
    return res.status(200).json(rsmg('000000'))
  }catch(e){
    logger.errorWithContext({ error: e, message: 'error' });
    return utils.returnErrorFunction(res, 'error', e);
  }
}