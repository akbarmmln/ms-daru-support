const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/create-loket', utils.verifyTokenMs, controller.createLoket);

module.exports = router;