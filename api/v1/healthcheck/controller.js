'use strict';

const sequelize = require('../../../config/db').Sequelize;
const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
const s3 = require('../../../config/oss').client;
let health = { serverOk: false, dbOk: false };

async function fileTypeFromBuffer(buffer) {
    const { fileTypeFromBuffer } = await import('file-type')
    return await fileTypeFromBuffer(buffer)
}

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

exports.coba = async function (req, res) {
    try {
        let file = req.body.file;
        let buf = Buffer.from(file,'base64')
        let filetype = await fileTypeFromBuffer(buf);
        let ext = filetype.ext;
        let mime = filetype.mime;
    
        let upload = await s3.listBuckets().promise();
        // let upload = await s3.upload({
        //     ACL: 'public-read',
        //     Bucket: 'bucket-sit-4yrlg',
        //     Key: `${await runNanoID(10)}.${ext}`,
        //     Body: buf,
        //     ContentEncoding: 'base64',
        //     ContentType: mime,
        // }).promise();
        return res.status(200).json(rsMsg('000000', upload));
    } catch (e) {
        return res.status(500).json(errMsg('01000'));
    }
}