const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/config', utils.verifyTokenMs, controller.createConfig);
router.post('/remove-config', utils.verifyTokenMs, controller.removeConfig);
router.post('/statued-config', utils.verifyTokenMs, controller.statusApproveReject);
router.post('/config', utils.verifyTokenMs, controller.getConfig);

router.get('/:id', controller.getDataMaster);

module.exports = router;