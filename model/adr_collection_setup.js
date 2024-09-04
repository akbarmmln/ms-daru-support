const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrCollectionSetup = dbConnection.define('adr_collection_setup', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  org_id: Sequelize.STRING,
  jenis_iuran: Sequelize.STRING,
  bulan_implementasi: Sequelize.STRING,
  tahun_implementasi: Sequelize.STRING,
  status: Sequelize.INTEGER,
  is_deleted: Sequelize.INTEGER,
  logging_id: Sequelize.STRING,
  tagihan: Sequelize.DECIMAL,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_collection_setup'
});

module.exports = adrCollectionSetup;