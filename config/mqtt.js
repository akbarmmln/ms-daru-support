const mqtt = require('mqtt');
const logger = require('./logger');

exports.mqttForLoket = async function () {
  for (let i = 1; i <= 5; i++) {
    (function (i) {  // Closure to maintain the correct value of `i`
      try {
        let topic = `loket-00${i}`;
        const qos = 0;
        const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8);

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
    })(i);  // Immediately invoked function expression (IIFE) with `i`
  }
}