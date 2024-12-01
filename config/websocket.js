const WebSocket = require("ws");
const clientId = 'serviceA';
const wsUrl = 'wss://ms-websocket-production.up.railway.app';
let reconnectDelay = 5000;
let wsInstance = null;
const logger = require('./logger');

function connectClientWS() {
    function connect() {
        wsInstance = new WebSocket(wsUrl);

        wsInstance.on('open', () => {
            // Register clientId
            logger.infoWithContext(`${clientId} connected to WebSocket server`)
            wsInstance.send(JSON.stringify({ type: 'register', clientId }));
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
            logger.errorWithContext({ error: e, message: `WebSocket error ${clientId}`})
            ws.close();
        });

        wsInstance.on('close', (code, reason) => {
            // Retry after a delay
            logger.infoWithContext(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`)
            logger.infoWithContext(`Retrying connection in ${reconnectDelay / 1000} seconds...`);
            setTimeout(connect, reconnectDelay);
        });

        wsInstance.on('ping', () => {
            logger.infoWithContext(`Received ping`);
            wsInstance.pong();
        });    
    }
    connect();
    return wsInstance;
}

module.exports = {
    connectClientWS,
    getWebSocket: () => wsInstance,
    WebSocket,
    clientId,
};