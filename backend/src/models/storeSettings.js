const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

// StoreSettings model for global store configuration (e.g., order sender email)
const StoreSettings = sequelize.define('StoreSettings', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderSenderEmail: { type: DataTypes.STRING, allowNull: false },
  orderSenderName: { type: DataTypes.STRING },
  smtpUser: { type: DataTypes.STRING },
  smtpPass: { type: DataTypes.STRING },
}, {
  timestamps: false,
  tableName: 'store_settings'
});

module.exports = StoreSettings;
