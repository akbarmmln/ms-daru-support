const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/healty', controller.healtyCheck);
router.post('/coba', controller.coba);

router.get('/seat-selection', controller.seatSelection);

module.exports = router;