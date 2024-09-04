const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrLogging = dbConnection.define('adr_logging', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  logging_id: Sequelize.STRING,
  aktivitas: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_logging'
});

module.exports = adrLogging;