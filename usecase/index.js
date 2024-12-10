const { connectClientWS } = require('../config/websocket');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const Constant = require('../utils/constant');
const format = require('../config/format');
const clients = require('../config/client');

exports.connectClientSocket = async function (params, podName) {
  try {
    const key = `${process.env.SERVICE_NAME}-${params}`
    const targetClient = await redisClient.hget('available_socket', `${key}`);
    if (targetClient) {
      logger.infoWithContext('this pod will be running as web socket client (2)')
      const hasil = JSON.parse(targetClient);
      const clientId = hasil.socketName

      const connectionDetails = await connectClientWS(params, podName, clientId);
      console.log('asdsadkaskdsadasd ', connectionDetails)
      clients.set(clientId, connectionDetails)
    } else {
      logger.infoWithContext('this pod can not running as web socket client (2)')
    }

    // const key = `${process.env.SERVICE_NAME}-${params}`
    // const data = await redisClient.get(Constant.formatNameRedis(Constant.Constant.REDIS.WEBSOCKET_CLIENT, 'microservice', `${key}`));
    // logger.infoWithContext(`detail data client ${data}`)
    // if (!format.isEmpty(data)) {
    //   logger.infoWithContext(`this client ${key} already connect as web service client`)
    // } else {
    //   connectClientWS(params, podName);
    // }
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'failed/error when running function connectClientSocket' })
  }
}