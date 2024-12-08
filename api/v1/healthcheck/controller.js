'use strict';

const sequelize = require('../../../config/db').Sequelize;
const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
let health = { serverOk: false, dbOk: false };

async function runNanoID(n) {
  const { customAlphabet } = await import('nanoid');
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
  const id = customAlphabet(alphabet, n);
  return id();
}

exports.healtyCheck = async function (req, res) {
  health.serverOk = true;
  let asynccc = await updateHealthResponse();
  if (asynccc == 200) {
    return res.status(200).json(rsMsg());
  } else {
    return res.status(500).json(errMsg('01000'));
  }
}

async function checkMySql() {
  await sequelize.authenticate()
    .then(() => { health.dbOk = true })
    .catch(err => { health.dbOk = false });
}

async function updateHealthResponse() {
  await checkMySql();
  const isReady = health.serverOk && health.dbOk;

  if (isReady) {
    logger.infoWithContext('[MS-DARU-SUPPORT] - Ready to serve traffic');
    return 200;
  } else {
    logger.infoWithContext('[MS-DARU-SUPPORT] - Unable to serve traffic');
    return 500
  }
}

const redisClient = require('../../../config/redis');
exports.coba = async function (req, res) {
  try {
    const targetClient = await redisClient.hget('available_socket', 'ms-support-1');
    let hasil;
    if (targetClient) {
      hasil = JSON.parse(targetClient);
    }
    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    console.log('errrorrr nya ', e)
    return res.status(200).json(errMsg('10000', 'internal server error', e))
  }
}