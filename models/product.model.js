module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
        },
        product_type: {
            type: Sequelize.STRING,
        },
        categoryId: {
            type: Sequelize.INTEGER,
        },
        editionId: {
            type: Sequelize.INTEGER,
        },
        supplier: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        image_url: {
            type: Sequelize.STRING
        },
        cost: {
            type: Sequelize.INTEGER
        },
        price: {
            type: Sequelize.INTEGER
        },
        brandId: {
            type: Sequelize.INTEGER
        },
        compId: {
            type: Sequelize.INTEGER
        },
        createdby: {
            type: Sequelize.INTEGER
        },
        creator: {
            type: Sequelize.STRING
        },
        year: {
            type: Sequelize.STRING
        },
        edition: {
            type: Sequelize.STRING
        },
        qty: {
            type: Sequelize.INTEGER
        },
        qty_type: {
            type: Sequelize.STRING
        },
        discount: {
            type: Sequelize.INTEGER
        },
        discount_type: {
            type: Sequelize.STRING
        }

    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Product;
};

