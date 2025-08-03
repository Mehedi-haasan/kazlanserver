module.exports = (sequelize, Sequelize) => {
    const Invoice = sequelize.define("invoice", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        date: {
            type: Sequelize.STRING
        },
        compId: {
            type: Sequelize.INTEGER
        },
        shopname: {
            type: Sequelize.STRING
        },
        createdby: {
            type: Sequelize.INTEGER
        },
        creator: {
            type: Sequelize.STRING
        },
        customername: {
            type: Sequelize.STRING
        },
        userId: {
            type: Sequelize.INTEGER
        },
        total: {
            type: Sequelize.INTEGER
        },
        packing: {
            type: Sequelize.INTEGER
        },
        delivery: {
            type: Sequelize.INTEGER
        },
        lastdiscount: {
            type: Sequelize.INTEGER
        },
        previousdue: {
            type: Sequelize.INTEGER
        },
        paidamount: {
            type: Sequelize.INTEGER
        },
        due: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: Sequelize.STRING,
        },
        type: {
            type: Sequelize.STRING,
        },
        paymentmethod: {
            type: Sequelize.STRING
        },
        methodname: {
            type: Sequelize.STRING
        },
        return: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        deliverydate: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Invoice;
};

