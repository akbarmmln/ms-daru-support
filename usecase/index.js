const { connectClientWS } = require('../config/websocket');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const Constant = require('../utils/constant');
const format = require('../config/format');

exports.connectClientSocket = async function (params, podName) {
  try {
    const key = `${process.env.SERVICE_NAME}-${params}`
    const data = await redisClient.get(Constant.formatNameRedis(Constant.Constant.REDIS.WEBSOCKET_CLIENT, 'microservice', `${key}`));
    if (!format.isEmpty(data)) {
      logger.infoWithContext(`this client ${key} already connect as web service client with detail data ${data}`)
    } else {
      connectClientWS(params, podName);
    }
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'failed/error when running function connectClientSocket' })
  }
}