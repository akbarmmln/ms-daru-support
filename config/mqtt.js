const mqtt = require('mqtt');
const logger = require('./logger');
const adrLoketAvail = require('../model/adr_loket_tersedia');
const redis = require('../config/redis');
global.clients = {};
const formats = require('./format');

async function createSqlLoket(paylod) {
  try {
    await adrLoketAvail.bulkCreate(paylod);
  } catch (e) {
    logger.errorWithContext({ error: e, message: `error while running sql create loket` });
  }
}

exports.createMqttConnection = async function (clientId) {
  try {
    const client = global.clients[clientId];
    if (!client) {
      const options = {
        host: process.env.HOST_MQTT_NEW,
        port: '8883',
        protocol: 'mqtts',
        username: process.env.USR_MQTT,
        password: process.env.PASS_MQTT,
        ca: [process.env.CA_CERT_MQTT_NEW.replace(/\\n/gm, '\n')],
        clientId: clientId
      }
      const client = mqtt.connect(options);  
      global.clients[clientId] = client;
  
      client.on('connect', () => {
        logger.infoWithContext(`Client with ID ${clientId} connected`);
      });
    
      client.on('message', (receivedTopic, message, packet) => {
        const packets = packet.payload.toString();
        logger.infoWithContext(`Received message from topic ${receivedTopic}: ${packets}`);
      });
  
      return client;
    } else {
      return client;
    }
  }catch(e){
    logger.errorWithContext({ error: e, message: `error membuat koneksi ke server mqtt` });
    return null;
  }
}

exports.addSubscription = async function (clientId, newTopics, saveTopic) {
  const client = global.clients[clientId];
  const qos = 0;
  if (client) {
    client.subscribe(newTopics, { qos }, (err, granted) => {
      if (err) {
        logger.errorWithContext({ error: err, message: `subscribe error to topic ${newTopics}` })
      } else {
        createSqlLoket(saveTopic);
        logger.infoWithContext(`Subscribe success to topic ${granted.map(grant => grant.topic)}`)
      }
    });
  } else {
    logger.infoWithContext(`Client with ID ${clientId} not found`);
  }
}

exports.mqttForLoket = async function () {
  for (let i = 1; i <= 1; i++) {
    (async function (i) {
      




      const client = await mqtt.createMqttConnection(clientId);

      client.on("connect", function (connack) {
        logger.infoWithContext(`client connected to ${topic}, ${JSON.stringify(connack)}`);

        client.subscribe(topic, { qos }, (error) => {
          if (error) {
            logger.errorWithContext({ error: error, message: `subscribe error to topic ${topic}` });
            return;
          }
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
    })(i);
  }
}

exports.mqttForCreateLoker = async function() {
  try {
    let message = {
      init: 'hellow mqtt'
    }
    message = JSON.stringify(message);
    const topic = 'server-loket';
    const qos = 0;
    const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8);

    const client = await exports.createMqttConnection(clientId);
    redis.set(topic, client);

    client.on("connect", function (connack) {
      logger.infoWithContext(`client connected to topic ${topic}, ${connack}`);

      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          logger.errorWithContext({ error: e, message: `subscribe error to topic : ${topic}` })
          return;
        }
        logger.infoWithContext(`Subscribe success to topic '${topic}'`)
      })
    })
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error while creating locker mqtt...' })
  }
}