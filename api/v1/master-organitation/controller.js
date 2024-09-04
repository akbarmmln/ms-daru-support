'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const adrCollectionOrg = require('../../../model/adr_collection_organitation');
const {fire} = require("../../../config/firebase");
const firestore = fire.firestore();
const adrCollectionSetup = require('../../../model/adr_collection_setup');
const adrLogging = require('../../../model/adr_logging');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const e = require('express');

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
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/master-organitation/:id...'});
    return utils.returnErrorFunction(res, 'error GET /api/v1/master-organitation/:id...', e);
  }
}

exports.getConfig = async function (req, res) {
  try {
    const org_id = req.organitation_id;

    const data = await adrCollectionSetup.findAll({
      raw: true,
      where: {
        is_deleted: 0,
        org_id: org_id,
        tahun_implementasi: formats.getCurrentTimeInJakarta(moment().format(), 'YYYY')
      }
    })

    if (data.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80001');
    }

    return res.status(200).json(rsmg('000000', data))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/master-organitation/config...'});
    return utils.returnErrorFunction(res, 'error GET /api/v1/master-organitation/config...', e);
  }
}

exports.createConfig = async function (req, res) {
  try {
    const org_id = req.organitation_id;
    const account_id = req.id;

    const request = req.body.request;
    if (!Array.isArray(request)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80002');
    }

    for (let i=0; i<request.length; i++) {
      let logging_id = uuidv4();
      let jenis_iuran = request[i].jenis_iuran;
      let bulan_implementasi = request[i].bulan_implementasi;
      let tahun_implementasi = request[i].tahun_implementasi;

      await adrCollectionSetup.create({
        id: uuidv4(),
        org_id: org_id,
        jenis_iuran: jenis_iuran,
        bulan_implementasi: bulan_implementasi,
        tahun_implementasi: tahun_implementasi,
        status: 2,
        is_deleted: 0,
        logging_id: logging_id
      })

      await adrLogging.create({
        id: uuidv4(),
        logging_id: logging_id,
        aktivitas: `${jenis_iuran} dibuat oleh id: ${account_id} pada tanggal ${formats.getCurrentTimeInJakarta(moment().format(), 'YYYY-MM-DD HH:mm:ss.SSS')}`
      })
    }
    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation/config...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation/config...', e);
  }
}

exports.removeConfig = async function (req, res) {
  try {
    const account_id = req.id;
    const id = req.body.id;
    
    const data = await adrCollectionSetup.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80001');
    }

    if (data && data?.status == 1) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80003');
    }

    await adrCollectionSetup.update({
      is_deleted: 1,
    }, {
      where: {
        id: data.id
      }
    })

    await adrLogging.create({
      id: uuidv4(),
      logging_id: data?.logging_id,
      aktivitas: `${data?.jenis_iuran} dihapus oleh id: ${account_id} pada tanggal ${formats.getCurrentTimeInJakarta(moment().format(), 'YYYY-MM-DD HH:mm:ss.SSS')}`
    })

    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation/remove-config...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation/remove-config...', e);
  }
}

exports.statusApproveReject = async function (req, res) {
  try {
    const account_id = req.id;
    const request = req.body.request;
    if (!Array.isArray(request)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80002');
    }

    for (let i=0; i<request.length; i++) {
      let id = request[i].id;
      let status = request[i].status;
      let aktivitas;

      const data = await adrCollectionSetup.findOne({
        raw: true,
        where: {
          id: id
        }
      })

      if (status == '1') {
        aktivitas = `${data?.jenis_iuran} disetujui oleh id: ${account_id} pada tanggal ${formats.getCurrentTimeInJakarta(moment().format(), 'YYYY-MM-DD HH:mm:ss.SSS')}`
      } else {
        aktivitas = `${data?.jenis_iuran} tidak disetujui oleh id: ${account_id} pada tanggal ${formats.getCurrentTimeInJakarta(moment().format(), 'YYYY-MM-DD HH:mm:ss.SSS')}`
      }

      await adrCollectionSetup.update({
        status: status
      }, {
        where: {
          id: data?.id
        }
      })

      await adrLogging.create({
        id: uuidv4(),
        logging_id: data?.logging_id,
        aktivitas: aktivitas
      })
    }

    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation/statued-config...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation/statued-config...', e);
  }
}