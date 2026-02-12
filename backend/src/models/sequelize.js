const { Sequelize } = require('sequelize');

// MySQL connection using Sequelize ORM
const sequelize = new Sequelize('gaming_store', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
