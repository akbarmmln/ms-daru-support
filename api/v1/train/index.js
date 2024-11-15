const express = require('express');
const router = express.Router();
const controller = require('./controller');
const utils = require('../../../utils/utils');

router.post('/ticket/available', controller.available);

router.get('/ticket/details/:id', controller.details);

module.exports = router;