const WebSocket = require("ws");
let clientId;
const wsUrl = process.env.SOCKET;
let reconnectDelay = 5000;
let wsInstance = null;
const logger = require('./logger');
const format = require('../config/format');
const redisClient = require('../config/redis');
const Constant = require('../utils/constant');

async function init(params) {
    const key = `${process.env.SERVICE_NAME}-${params}`
    const data = await redisClient.get(Constant.formatNameRedis(Constant.Constant.REDIS.WEBSOCKET_CLIENT, 'microservice', `${key}`));
    if (!format.isEmpty(data)) {
        logger.infoWithContext(`this client ${key} already connect as web service client with detail data ${JSON.parse(data)}`)
        return false;
    } else {
        const targetClient = await redisClient.hget('available_socket', `${key}`);
        if (targetClient) {
            const hasil = JSON.parse(targetClient);
            clientId = hasil.socketName
        } else {
            clientId = null;
        }    
        return true;
    }
}

async function connectClientWS(params, podName) {
    async function connect() {
        if (!format.isEmpty(clientId)) {
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
        } else {
            logger.infoWithContext('this pod can not running as web socket client (2)')
        }
    }
    const hash = await init(params);
    if (hash) {
        await connect();
        return wsInstance;
    }
}

module.exports = {
    connectClientWS,
    getWebSocket: () => wsInstance,
    WebSocket,
    clientId: () => clientId,
};