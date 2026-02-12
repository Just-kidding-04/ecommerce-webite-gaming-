const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false }
  }, {
    timestamps: true
  })
  return Review
}
