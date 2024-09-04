const express = require('express');
const router = express.Router();
const fs = require('fs');
const location = (name = '') => name ? `api/v1/${name}` : 'api/v1';
const logger = require('./config/logger');

/* SET CORS HEADERS FOR API */
router.all('/api/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('os', req.headers['os']);
    res.header('app-version', req.headers['app-version']);
    next();
})

fs.readdirSync(location())
.forEach(file => {
    const path = `/${location(file)}`;
    router.use(path, require(`.${path}`));
});

module.exports = router;