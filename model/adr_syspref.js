const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const moment = require('moment');

const adrSysPref = dbConnection.define('sys_pref', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  name: Sequelize.STRING,
  value: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'sys_pref'
});

module.exports = adrSysPref;