const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/version-apps', controller.getTNC);

module.exports = router;