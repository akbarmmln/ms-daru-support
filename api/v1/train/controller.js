'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrKereta = require('../../../model/adr_kereta')
const adrGerbongKereta = require('../../../model/adr_gerbong_kereta')
const adrGerbongDetails = require('../../../model/adr_gerbong_details')
const dbConnection = require('../../../config/db').Sequelize;
const sequelize = require('sequelize');
const { WebSocket } = require('../../../config/websocket');
const client = require('../../../config/client');

exports.available = async function (req, res) {
  try {
    const data = await dbConnection.query("SELECT * FROM ms_control_panel.adr_kereta JOIN ms_control_panel.adr_gerbong_kereta " +
      "ON adr_kereta.id = adr_gerbong_kereta.id_kereta " +
      "JOIN ms_control_panel.adr_gerbong_details " +
      "ON adr_gerbong_kereta.id = adr_gerbong_details.id_gerbong",
      { type: sequelize.QueryTypes.SELECT }, { raw: true }
    );

    const result = data.reduce((acc, item) => {
      const existingTrain = acc.find(train => train.id_kereta === item.id_kereta);
      if (!existingTrain) {
        acc.push({
          id_kereta: item.id_kereta,
          nama_kereta: item.nama_kereta
        });
      }
      return acc;
    }, []);

    for (let j = 0; j < result.length; j++) {
      const targetIdKereta = result[j].id_kereta
      const count = data.filter(item => item.id_kereta === targetIdKereta && item.status === 1).length;
      result[j].sisa_kursi = count
    }

    return res.status(200).json(rsmg('000000', result));
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/train/ticket/available...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/train/ticket/available...', e);
  }
}

exports.checkSeats = async function (req, res) {
  try {
    const id_kereta = req.params.id;

    const data = await adrKereta.findOne({
      include: [{
        model: adrGerbongKereta,
        required: true,
        as: 'gerbong',
        include: [
          {
            model: adrGerbongDetails,
            required: true,
            as: 'gerbongDetails'
          }
        ]
      }],
      where: sequelize.literal(`adr_kereta.id = '${id_kereta}'`)
    })

    return res.status(200).json(rsmg('000000', data))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/train/check-seat/:id...' });
    return utils.returnErrorFunction(res, 'error GET /api/v1/train/check-seat/:id...', e);
  }
}

exports.socketPublish = async function (req, res) {
  try {
    const clientArray = Array.from(client.keys());
    logger.infoWithContext(`asdasdasdad: ${client.size}`);
    logger.infoWithContext(`clientArray1: ${clientArray}`);
    logger.infoWithContext(`clientArray2: ${clientArray[0]}`);
    console.log(`clientArray3: ${clientArray}`)

    const ws = client.get(clientArray[0]);
    const target_client_id = req.body.target_client_id;
    const pesan = req.body.pesan;

    // const ws = getWebSocket();
    // console.log('asdasdasdasdasd', ws)
    // if (ws && ws.readyState === WebSocket.OPEN) {
    //   const payload = {
    //     type: 'message',
    //     targetClientId: target_client_id,
    //     payload: pesan
    //   }
    //   ws.send(JSON.stringify(payload));
    // }
    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/train/coba...' });
    return utils.returnErrorFunction(res, 'error GET /api/v1/train/coba...', e);
  }
}