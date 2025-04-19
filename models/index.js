const config = require("../config/db.config");
const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2"); 

// Initialize Sequelize
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  dialectModule: mysql2, 
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle
  },
  logging: false, 
});


// Create `db` object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);
db.product = require("./product.model")(sequelize, Sequelize);
db.saleorder = require("./saleorder.model")(sequelize, Sequelize);
db.company = require("./company.model")(sequelize, Sequelize);
db.message = require("./message.model")(sequelize, Sequelize);
db.state = require("./state.model")(sequelize, Sequelize);
db.category = require("./category.model")(sequelize, Sequelize);
db.notification = require("./notification.model")(sequelize, Sequelize);
db.invoice = require("./invoice.model")(sequelize, Sequelize);
db.brand = require("./brand.model")(sequelize, Sequelize);
db.customer = require("./customer.model")(sequelize, Sequelize);

// Sale Order Relationship
db.product.hasMany(db.saleorder, {
  foreignKey: "product_id",
  onDelete: 'CASCADE',
});
db.saleorder.belongsTo(db.product, {
  foreignKey: "product_id",
  onDelete: 'CASCADE',
});

// State Relationship
db.state.hasMany(db.user, {
  foreignKey: "stateId",
  onDelete: 'CASCADE',
});
db.user.belongsTo(db.state, {
  foreignKey: "stateId",
  onDelete: 'CASCADE',
});

// Sale Order Relationship
db.customer.hasMany(db.saleorder, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});
db.saleorder.belongsTo(db.customer, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});


db.category.hasMany(db.saleorder, {
  foreignKey: "categoryId",
  onDelete: 'CASCADE',
});
db.saleorder.belongsTo(db.category, {
  foreignKey: "categoryId",
  onDelete: 'CASCADE',
});


db.customer.hasMany(db.notification, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});
db.notification.belongsTo(db.customer, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});


db.invoice.hasMany(db.saleorder, {
  foreignKey: "invoice_id",
  onDelete: 'CASCADE',
});
db.saleorder.belongsTo(db.invoice, {
  foreignKey: "invoice_id",
  onDelete: 'CASCADE',
});


db.brand.hasMany(db.product, {
  foreignKey: "brandId",
  onDelete: 'CASCADE',
});
db.product.belongsTo(db.brand, {
  foreignKey: "brandId",
  onDelete: 'CASCADE',
});

db.category.hasMany(db.product, {
  foreignKey: "categoryId",
  onDelete: 'CASCADE',
});
db.product.belongsTo(db.category, {
  foreignKey: "categoryId",
  onDelete: 'CASCADE',
});

db.company.hasMany(db.product, {
  foreignKey: "compId",
  onDelete: 'CASCADE',
});
db.product.belongsTo(db.company, {
  foreignKey: "compId",
  onDelete: 'CASCADE',
});

module.exports = db;
