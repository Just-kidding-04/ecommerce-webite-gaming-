module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.User, { foreignKey: 'userId' });
    CartItem.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return CartItem;
};
