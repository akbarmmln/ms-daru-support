const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/available', controller.available);

router.get('/check-seat/:id', controller.checkSeats);

module.exports = router;