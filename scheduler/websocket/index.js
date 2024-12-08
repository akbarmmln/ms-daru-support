const logger = require('../../config/logger');
const ucConnectWebSocket = require('../../config/websocket');
const {workerData, parentPort} = require("worker_threads");

logger.infoWithContext(`Task[${workerData.topic}] Worker[${workerData.id}] start....`);

ucConnectWebSocket.connectClientWS().then(()=>{
    parentPort.postMessage(`Task[${workerData.topic}] Worker[${workerData.id}] finished....`);
}).catch(function (error) {
    logger.errorWithContext({ error, message: 'Error running initiate web socket client' });
    parentPort.postMessage(`Task[${workerData.topic}] Worker[${workerData.id}] error....`);
});