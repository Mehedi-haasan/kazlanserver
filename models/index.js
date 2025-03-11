const config = require("../config/db.config");
const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2"); // Ensure mysql2 is required

// Initialize Sequelize
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  dialectModule: mysql2, // Ensure mysql2 is used
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle
  },
  logging: true, // Disable logging for cleaner output
});

// Create `db` object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);
db.product = require("./ProductModel")(sequelize, Sequelize);
db.saleorder = require("./saleorder.model")(sequelize, Sequelize);
db.company = require("./company.model")(sequelize, Sequelize);
db.message = require("./message.model")(sequelize, Sequelize);
db.state = require("./state.model")(sequelize, Sequelize);
db.category = require("./category.model")(sequelize, Sequelize);
db.userdue = require("./userDue")(sequelize, Sequelize);
db.notification = require("./notification.model")(sequelize, Sequelize);
db.invoice = require("./invoice.model")(sequelize, Sequelize);
db.brand = require("./brand.model")(sequelize, Sequelize);

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
db.user.hasMany(db.saleorder, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});
db.saleorder.belongsTo(db.user, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});

// User Due Relationship
db.user.hasMany(db.userdue, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});
db.userdue.belongsTo(db.user, {
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


db.user.hasMany(db.notification, {
  foreignKey: "userId",
  onDelete: 'CASCADE',
});
db.notification.belongsTo(db.user, {
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


module.exports = db;
