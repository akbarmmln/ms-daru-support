const WebSocket = require("ws");
let clientId;
const wsUrl = process.env.SOCKET;
let reconnectDelay = 5000;
let wsInstance = null;
const logger = require('./logger');
const format = require('../config/format');

async function connectClientWS(params, podName, clientId) {
    async function connect() {
        wsInstance = new WebSocket(wsUrl);

        wsInstance.on('open', () => {
            // Register clientId
            logger.infoWithContext(`${clientId} connected to WebSocket server`)
            const additonal = {
                service: `${process.env.SERVICE_NAME}`,
                podsName: podName,
                pods: params,
                socketName: clientId            
            }
            wsInstance.send(JSON.stringify({ type: 'register', agent: 'microservice', clientId, additonal: additonal }));
        });

        wsInstance.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                logger.infoWithContext(`Message received: ${JSON.stringify(data)}`)
            } catch (e) {
                logger.errorWithContext({ error: e, message: 'Error parsing message:'})
            }
        });

        wsInstance.on('error', (err) => {
            // Graceful handling: Close the connection to trigger reconnect logic
            logger.errorWithContext({ error: err, message: `WebSocket error ${clientId}`})
            wsInstance.close();
        });

        wsInstance.on('close', (code, reason) => {
            // Retry after a delay
            logger.infoWithContext(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`)
            // logger.infoWithContext(`Retrying connection in ${reconnectDelay / 1000} seconds...`);
            // setTimeout(connect, reconnectDelay);
        });

        wsInstance.on('ping', () => {
            logger.infoWithContext(`Received ping`);
            wsInstance.pong();
        });
    }
    await init(params);
    await connect();
    return wsInstance;
}

module.exports = {
    connectClientWS,
    WebSocket,
}