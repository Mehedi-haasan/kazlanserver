module.exports = (sequelize, Sequelize) => {
    const saleorder = sequelize.define("saleorder", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        invoice_id: {
            type: Sequelize.INTEGER,
        },
        compId: {
            type: Sequelize.INTEGER,
        },
        product_id: {
            type: Sequelize.INTEGER,
        },
        username: {
            type: Sequelize.STRING,
        },
        userId: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING
        },
        shop: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.INTEGER,
        },
        discount: {
            type: Sequelize.INTEGER,
        },
        discount_type: {
            type: Sequelize.STRING,
        },
        createdby: {
            type: Sequelize.INTEGER,
        },
        creator: {
            type: Sequelize.STRING,
        },
        sellprice: {
            type: Sequelize.INTEGER,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
        contact: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        deliverydate: {
            type: Sequelize.STRING
        }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return saleorder;
};


