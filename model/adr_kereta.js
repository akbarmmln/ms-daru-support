const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const moment = require('moment');

const adrKereta = dbConnection.define('adr_kereta', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama_kereta: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_kereta'
});

module.exports = adrKereta;