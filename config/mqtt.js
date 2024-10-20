const mqtt = require('mqtt');
const logger = require('./logger');

exports.mqtt = async function () {
    try {
        const topic = 'loket-001'
        const qos = 0
        const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8)

        const client = mqtt.connect(process.env.HOST_MQTT, {
            ca: [process.env.CA_CERT_MQTT.replace(/\\n/gm, '\n')],
            username: process.env.USR_MQTT,
            password: process.env.PASS_MQTT,
            clientId: clientId
        })

        client.on("connect", function (connack) {
            logger.infoWithContext(`client connected ${topic}, ${JSON.stringify(connack)}`)

            client.subscribe(topic, { qos }, (error) => {
                if (error) {
                    logger.errorWithContext({ error: error, message: 'subscribe error:' })
                    return
                }
                logger.infoWithContext(`Subscribe to topic ${topic}`)
            })
        })

        client.on("error", function (err) {
            logger.errorWithContext({ error: err, message: 'Error: ' })
            if (err.code == "ENOTFOUND") {
                logger.infoWithContext(`Network error, make sure you have an active internet connection`)
            }
        })

        client.on("close", function () {
            logger.infoWithContext("Connection closed by client")
        })

        client.on("reconnect", function () {
            logger.infoWithContext("Client trying a reconnection")
        })

        client.on("offline", function () {
            logger.infoWithContext("Client is currently offline")
        })

        client.on('message', function (topic, message, packet) {
            try {
                let a = packet.payload.toString()
                let b = JSON.parse(a)
                logger.infoWithContext(`message received, ${a}`)
                logger.infoWithContext(`message received in json , ${JSON.stringify(b)}`)
            } catch (e) {
                logger.errorWithContext({ error: e, message: 'error on message received parsing...' })
            }
        })
        client.on("packetsend", function (packet) {
            logger.infoWithContext(`packetsend, ${packet}`);
        })
    } catch (e) {
        logger.errorWithContext({ error: e, message: 'Internal server error - error mqtt' })
    }
}