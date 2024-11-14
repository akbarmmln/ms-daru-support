const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const moment = require('moment');

const adrGerbongKereta = dbConnection.define('adr_gerbong_kereta', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_kereta: Sequelize.STRING,
  nomer_urut: Sequelize.INTEGER,
  nama_gerbong: Sequelize.STRING,
  denah_kursi: Sequelize.STRING,
  baris_kursi: Sequelize.INTEGER
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_gerbong_kereta'
});

module.exports = adrGerbongKereta;