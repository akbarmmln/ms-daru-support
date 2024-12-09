const logger = require('../../config/logger');
const usecase = require('../../usecase/index')
const { workerData, parentPort } = require("worker_threads");

logger.infoWithContext(`Task[${workerData.topic}] Worker[${workerData.id}] start....`);

usecase.connectClientSocket(workerData.part, workerData.podName).then(()=>{
    parentPort.postMessage(`Task[${workerData.topic}] Worker[${workerData.id}] part[${workerData.part}] pod[${workerData.podName}] finished....`);
}).catch(function (error) {
    logger.errorWithContext({ error, message: 'Error running initiate web socket client' });
    parentPort.postMessage(`Task[${workerData.topic}] Worker[${workerData.id}] error....`);
});