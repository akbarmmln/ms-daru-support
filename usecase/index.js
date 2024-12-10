const { connectClientWS } = require('../config/websocket');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const Constant = require('../utils/constant');
const format = require('../config/format');
const clients = require('../config/client');

exports.connectClientSocket = async function (params, podName) {
  try {
    const key = `${process.env.SERVICE_NAME}-${params}`
    const logged = await redisClient.get(Constant.formatNameRedis(Constant.Constant.REDIS.WEBSOCKET_CLIENT, 'microservice', `${key}`));
    if (format.isEmpty(logged)) {
      const targetClient = await redisClient.hget('available_socket', `${key}`);
      if (targetClient) {
        logger.infoWithContext('this pod will be running as web socket client (2)')
        const hasil = JSON.parse(targetClient);
        const clientId = hasil.socketName
  
        const connectionDetails = await connectClientWS(params, podName, clientId);
        clients.set(clientId, connectionDetails)
      } else {
        logger.infoWithContext('this pod can not running as web socket client (2)')
      }  
    } else {
      logger.infoWithContext(`this pod already connected as web socket client with detail data : ${logged}`)
    }
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'failed/error when running function connectClientSocket' })
  }
}