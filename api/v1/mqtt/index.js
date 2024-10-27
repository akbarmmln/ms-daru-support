const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/create-loket', utils.verifyTokenMs, controller.createLoket);
router.post('/remove-loket', utils.verifyTokenMs, controller.removeLoket);

router.get('/get', controller.get);

module.exports = router;