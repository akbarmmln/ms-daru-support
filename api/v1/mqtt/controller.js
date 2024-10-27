'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrLoketAvail = require('../../../model/adr_loket_tersedia');
const mqtt = require('../../../config/mqtt');
const dbconnect = require('../../../config/db').Sequelize;

async function runNanoID(n) {
  const { customAlphabet } = await import('nanoid');
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
  const id = customAlphabet(alphabet, n);
  return id();
}

exports.createLoket = async function (req, res) {
  try {
    const jumlah_counter = req.body.jumlah_counter;
    const num_counter = parseInt(jumlah_counter);
    const clientId = 'mqtt_antiran';

    let pushTopic = [];
    let pushSaveData = [];

    for (let i = 1; i <= num_counter; i++) {
      try {
        let id = await runNanoID(5);
        let topic = `loket-${id}`;  
        let payloadCreate = {
          id: uuidv4(),
          created_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
          created_by: req.id,
          is_deleted: 0,
          nama_loket: topic,
          client_topic: topic,
          client_id: clientId
        }
        pushTopic.push(topic);
        pushSaveData.push(payloadCreate)
      } catch (e) {
        logger.errorWithContext({ error: e, message: `looping occurs error in topic created` });
        continue;
      }
    }

    await mqtt.createMqttConnection(clientId);
    await mqtt.addSubscription(clientId, pushTopic, pushSaveData);
    
    return res.status(200).json(rsmg('000000', pushSaveData));
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/mqtt/create-loket...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/mqtt/create-loket...', e);
  }
}

exports.removeLoket = async function (req, res) {
  const transactionDB = await dbconnect.transaction();
  try {
    const clientId = req.body.clientId;
    const topic = req.body.topic;
    const client = global.clients[clientId];
    if (client) {
      const details = await adrLoketAvail.findOne({
        raw: true,
        where: {
          client_topic: topic
        },
        lock: true,
        transactionDB
      })

      await endSubscriptionMqtt(client, topic);

      await adrLoketAvail.update({
        is_deleted: 1
      }, {
        where: {
          id: details?.id
        },
        transaction: transactionDB
      })
    }

    await transactionDB.commit();
    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    if (transactionDB) {
      await transactionDB.rollback();
    }
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/mqtt/remove-loket...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/mqtt/remove-loket...', e);
  }
}

function endSubscriptionMqtt(client, topic) {
  const qos = 0;
  return new Promise((resolve, reject) => {
    client.unsubscribe(topic, { qos }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function endClientMqtt(client) {
  return new Promise((resolve, reject) => {
    client.end(false, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

exports.get = async function(req, res) {
  try{
    return res.status(200).json(rsmg('000000'))
  }catch(e){
    logger.errorWithContext({ error: e, message: 'error' });
    return utils.returnErrorFunction(res, 'error', e);
  }
}