const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/available', utils.verifyTokenMs, controller.available);

router.get('/check-seat/:id', utils.verifyTokenMs, controller.checkSeats);

module.exports = router;