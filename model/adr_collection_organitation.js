const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrCollectionOrg = dbConnection.define('adr_collection_organitation', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE,
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE,
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  org_name: Sequelize.STRING,
  org_rt: Sequelize.STRING,
  org_rw: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_collection_organitation'
});

module.exports = adrCollectionOrg;