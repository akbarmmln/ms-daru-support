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
const Sequelize = require('sequelize');
const httpCaller = require('../../../config/httpCaller');

async function runNanoID(n) {
  const { customAlphabet } = await import('nanoid');
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
  const id = customAlphabet(alphabet, n);
  return id();
}

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
    const tahun_implementasi = req.body.tahun_implementasi;
  
    const data = await adrCollectionSetup.findAll({
      raw: true,
      where: {
        is_deleted: 0,
        org_id: org_id,
        tahun_implementasi: tahun_implementasi
      }
    })

    if (data.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80001');
    }

    let dataPush = [];
    for (let i = 0; i < data.length; i++) {
      const logging = await adrLogging.findAll({
        where: {
          logging_id: data[i].logging_id
        },
        order: [
          ['created_dt', 'ASC']
        ]  
      })

      dataPush.push({
        ...data[i],
        logging
      })
    }

    res.header('access-token', req['access-token']);
    return res.status(200).json(rsmg('000000', dataPush))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation/config...'});
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation/config...', e);
  }
}

exports.getConfigTahun = async function (req, res) {
  try{
    const org_id = req.organitation_id;

    const data = await adrCollectionSetup.findAll({
      raw: true,
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('tahun_implementasi')), 'tahun_implementasi']
      ],
      where: {
        org_id: org_id
      },
      order: [
        ['tahun_implementasi', 'ASC']
      ]
    })

    res.header('access-token', req['access-token']);
    return res.status(200).json(rsmg('000000', data))
  }catch(e){
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/master-organitation/config-tahun...'});
    return utils.returnErrorFunction(res, 'error GET /api/v1/master-organitation/config-tahun...', e);
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

    let accountData = await httpCaller({
      method: 'POST',
      url: process.env.MS_ACCOUNT_V1_URL + '/account/inquiry',
      data: {
        account_id: account_id
      }
    })
    accountData = accountData.data;

    for (let i=0; i<request.length; i++) {
      let jenis_id = await runNanoID(10);
      // let jenis_id = uuidv4();
      let logging_id = uuidv4();
      let jenis_iuran = request[i].jenis_iuran;
      let bulan_implementasi = request[i].bulan_implementasi;
      let tahun_implementasi = request[i].tahun_implementasi;
      let tagihan = request[i].tagihan;
      
      await adrCollectionSetup.create({
        id: jenis_id,
        org_id: org_id,
        jenis_iuran: jenis_iuran,
        bulan_implementasi: bulan_implementasi,
        tahun_implementasi: tahun_implementasi,
        status: 2,
        is_deleted: 0,
        logging_id: logging_id,
        tagihan: tagihan
      })

      await adrLogging.create({
        id: uuidv4(),
        logging_id: logging_id,
        aktivitas: `${jenis_iuran}[${jenis_id}] dibuat oleh: ${accountData.data.nama}[${accountData.data.kk}] pada tanggal ${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      })
    }
    res.header('access-token', req['access-token']);
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
        id: id,
        is_deleted: 0
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80001');
    }

    if (data && data?.status == 1) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80003');
    }

    let accountData = await httpCaller({
      method: 'POST',
      url: process.env.MS_ACCOUNT_V1_URL + '/account/inquiry',
      data: {
        account_id: account_id
      }
    })
    accountData = accountData.data;

    await adrCollectionSetup.update({
      is_deleted: 1,
    }, {
      where: {
        id: data?.id
      }
    })

    await adrLogging.create({
      id: uuidv4(),
      logging_id: data?.logging_id,
      aktivitas: `${data?.jenis_iuran}[${data?.id}] dihapus oleh id: ${account_id} pada tanggal ${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    })

    res.header('access-token', req['access-token']);
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

    let accountData = await httpCaller({
      method: 'POST',
      url: process.env.MS_ACCOUNT_V1_URL + '/account/inquiry',
      data: {
        account_id: account_id
      }
    })
    accountData = accountData.data;


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
        aktivitas = `${data?.jenis_iuran}[${data?.id}] disetujui oleh: ${accountData.data.nama}[${accountData.data.kk}] pada tanggal ${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`
      } else {
        aktivitas = `${data?.jenis_iuran}[${data?.id}] tidak disetujui oleh: ${accountData.data.nama}[${accountData.data.kk}] pada tanggal ${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`
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
        aktivitas: aktivitas,
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      })
    }

    res.header('access-token', req['access-token']);
    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation/statued-config...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation/statued-config...', e);
  }
}