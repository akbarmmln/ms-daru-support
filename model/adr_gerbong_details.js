const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const moment = require('moment');

const adrGerbongDetails = dbConnection.define('adr_gerbong_details', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_gerbong: Sequelize.STRING,
  id_kursi: Sequelize.STRING,
  status: Sequelize.INTEGER
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_gerbong_details'
});

module.exports = adrGerbongDetails;