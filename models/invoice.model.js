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
        created_date: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW,
        },
        payment_type: {
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
            type: Sequelize.INTEGER,
            allowNull: true,
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
        order_type: {
            type: Sequelize.STRING,
            defaultValue: "Online"
        },
        is_edit: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        return: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        sup_invo: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        special_discount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        deliverydate: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        note: {
            type: Sequelize.STRING,
            defaultValue: ''
        }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Invoice;
};

