const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gaming_store',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

// User model with role-based access (admin, seller, user)
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  // Role: 'admin' (full access), 'seller' (selling only), 'user' (regular user)
  role: { type: DataTypes.ENUM('admin', 'seller', 'user'), defaultValue: 'user' },
  // Seller specific fields
  businessName: { type: DataTypes.STRING },
  businessType: { type: DataTypes.STRING },
  gstNumber: { type: DataTypes.STRING },
  panNumber: { type: DataTypes.STRING },
  sellerAddress: { type: DataTypes.JSON },
  sellerVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  // User preferences
  preferences: { type: DataTypes.TEXT },
}, {
  getterMethods: {
    // Backward compatibility getters
    isAdmin() {
      return this.role === 'admin';
    },
    isSeller() {
      return this.role === 'seller' || this.role === 'admin';
    }
  }
});

// StoreSettings model
const StoreSettings = require('./storeSettings');
// Category model
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  image: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
});

// Product model
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  short: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  originalPrice: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
  images: { type: DataTypes.JSON },
  features: { type: DataTypes.JSON },
  specs: { type: DataTypes.JSON },
  brand: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 10 },
  rating: { type: DataTypes.FLOAT, defaultValue: 4.5 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  categoryId: { type: DataTypes.INTEGER },
  sellerId: { type: DataTypes.INTEGER },
  dealPercent: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 means no deal
  isDeal: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

// Specification model
const Specification = sequelize.define('Specification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  ProductId: { type: DataTypes.INTEGER },
});

// Order model
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  subtotal: { type: DataTypes.FLOAT },
  shipping: { type: DataTypes.FLOAT, defaultValue: 0 },
  tax: { type: DataTypes.FLOAT, defaultValue: 0 },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  address: { type: DataTypes.JSON },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'cod' },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
});

// OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  name: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
});

// CartItem model
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

// Address model
const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  line1: { type: DataTypes.STRING, allowNull: false },
  line2: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  zip: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Wishlist model
const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
});

// Image model
const Image = sequelize.define('Image', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  url: { type: DataTypes.STRING, allowNull: false },
  productId: { type: DataTypes.INTEGER },
});

// Review model
const Review = require('./review')(sequelize)

// Associations
User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

Product.hasMany(Image, { foreignKey: 'productId' });
Image.belongsTo(Product, { foreignKey: 'productId' });

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Product.belongsTo(User, { foreignKey: 'sellerId', as: 'Seller' });
User.hasMany(Product, { foreignKey: 'sellerId', as: 'SellerProducts' });

Product.hasMany(Specification, { foreignKey: 'ProductId', as: 'specifications' });
Specification.belongsTo(Product, { foreignKey: 'ProductId' });

CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

Wishlist.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

// Coupon model
const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  discountType: { type: DataTypes.ENUM('percentage', 'fixed'), defaultValue: 'percentage' },
  discountValue: { type: DataTypes.FLOAT, allowNull: false }, // e.g., 10 for 10% or 10$
  minPurchase: { type: DataTypes.FLOAT, defaultValue: 0 },
  maxDiscount: { type: DataTypes.FLOAT }, // Max discount amount for percentage coupons
  expiryDate: { type: DataTypes.DATE },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  usageLimit: { type: DataTypes.INTEGER, defaultValue: 100 },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Order,
  OrderItem,
  CartItem,
  Address,
  Wishlist,
  Image,
  Specification,
  Coupon,
  StoreSettings,
  Review
};
