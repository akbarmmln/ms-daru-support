const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const moment = require('moment');

const adrLogging = dbConnection.define('adr_logging', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  logging_id: Sequelize.STRING,
  aktivitas: Sequelize.STRING,
  created_dt: Sequelize.DATE(6),
  created_dt_vs: {
    type: Sequelize.VIRTUAL,
    get() {
      const createdDt = this.getDataValue('created_dt');
      return createdDt ? moment(createdDt).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') : null;
    }
  }
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_logging'
});

module.exports = adrLogging;