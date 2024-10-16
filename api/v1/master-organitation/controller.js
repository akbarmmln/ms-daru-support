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
const xlsx = require('xlsx');

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

function readExcelFromFile(path) {
  const workbook = xlsx.readFile(path); 
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return worksheet;
}

function readExcelFromBase64(base64) {
  const binaryString = Buffer.from(base64, 'base64');
  const workbook = xlsx.read(binaryString, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return worksheet;
}

exports.inputCheckFile = async function (req, res) {
  try {
    const path = req.body.path;

    const worksheet = readExcelFromBase64(path)
    const cellAddress = 'B1';
    const cell = worksheet[cellAddress];
    
    const tahun = cell?.v;
    if (formats.isEmpty(tahun)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80004', `kolom tahun implementasi kosong: perlu koreksi pada kolom tahun implementasi`);
    }

    const jsonData = [];
    for (let row = 4; row <= 13; row++) {
      const rowData = {
        nama_iuran: worksheet[`A${row}`] ? worksheet[`A${row}`].v : null,
        bulan_implementasi: worksheet[`B${row}`] ? worksheet[`B${row}`].v : null,
        nominal_tagihan: worksheet[`C${row}`] ? worksheet[`C${row}`].v : null,
      };
      
      if (rowData.nama_iuran || rowData.bulan_implementasi || rowData.nominal_tagihan) {
        jsonData.push(rowData);
      }
    }

    let row = 4;
    for (let i=0; i<jsonData.length; i++) {
      if (formats.isEmpty(jsonData[i].nama_iuran)) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80005', `kolom nama iuran kosong: perlu koreksi pada baris ke-${row}`);
      }

      if (formats.isEmpty(jsonData[i].bulan_implementasi)) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80005', `kolom bulan implementasi kosong: perlu koreksi pada baris ke-${row}`);
      }

      if (formats.isEmpty(jsonData[i].nominal_tagihan)) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80005', `kolom nominal tagihan kosong: perlu koreksi pada baris ke-${row}`);
      }

      if (jsonData[i].bulan_implementasi != '0' && !(Number(jsonData[i].bulan_implementasi) >= 1 && Number(jsonData[i].bulan_implementasi) <= 12 && /^[0-9]+$/.test(jsonData[i].bulan_implementasi))) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80005', `kesalahan input pada kolom bulan implementasi: perlu koreksi pada baris ke-${row}`);
      }

      const numericPattern = /^[0-9]+$/;
      if (!numericPattern.test(jsonData[i].nominal_tagihan)) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '80005', `kesalahan input pada kolom nominal tagihan: perlu koreksi pada baris ke-${row}`);
      }

      row = row + 1;
    }

    res.header('access-token', req['access-token']);
    return res.status(200).json(rsmg('000000', {
      tahun: cell?.v,
      data: jsonData,
      length: jsonData.length
    }))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/master-organitation//input/cek-file...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/master-organitation//input/cek-file...', e);
  }
}