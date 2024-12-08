const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/create-config', utils.verifyTokenMs, controller.createConfig);
router.post('/remove-config', utils.verifyTokenMs, controller.removeConfig);
router.post('/statued-config', utils.verifyTokenMs, controller.statusApproveReject);
router.post('/config', utils.verifyTokenMs, controller.getConfig);
router.get('/config-tahun', utils.verifyTokenMs, controller.getConfigTahun);
router.post('/input/cek-file', utils.verifyTokenMs, controller.inputCheckFile);

router.get('/:id', controller.getDataMaster);
router.post('/list-bucket', controller.listBuckets);

module.exports = router;