'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const adrCollectionOrg = require('../../../model/adr_collection_organitation');
const axios = require('axios');
const {fire} = require("../../../config/firebase");
const firestore = fire.firestore();

exports.getDataMaster = async function (req, res) {
  try {
    const id = req.params.id;

    const dataMaster = await adrCollectionOrg.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    if (!dataMaster) {
      return res.status(200).json(rsmg('80001', {}));
    }

    return res.status(200).json(rsmg('000000', dataMaster));
  } catch (e) {
    logger.error('error GET /api/v1/master-organitation/:id...', e);
    return utils.returnErrorFunction(res, 'error GET /api/v1/master-organitation/:id...', e);
  }
}