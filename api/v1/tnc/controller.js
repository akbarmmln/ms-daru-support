'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSysPref = require('../../../model/adr_syspref');

exports.getTNC = async function (req, res) {
  try {
    const syspref_tnc = await adrSysPref.findOne({
      raw: true,
      where: {name: 'tnc_version'}
    })
    return res.json(rsmg('000000', syspref_tnc));
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/tnc/app-version...' });
    return utils.returnErrorFunction(res, 'error GET /api/v1/tnc/app-version...', e);
  }
}