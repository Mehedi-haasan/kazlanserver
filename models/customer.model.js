module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customer", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        bankname: {
            type: Sequelize.STRING
        },
        accountname: {
            type: Sequelize.STRING
        },
        accountnumber: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.INTEGER
        },
        address: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        stateId: {
            type: Sequelize.INTEGER,
        },
        compId: {
            type: Sequelize.INTEGER,
        },
        usertype: {
            type: Sequelize.STRING
        },
        customertype: {
            type: Sequelize.STRING
        },
        balance_type: {
            type: Sequelize.STRING
        },
        cretedby: {
            type: Sequelize.INTEGER
        },
        creator: {
            type: Sequelize.STRING
        },
        image_url: {
            type: Sequelize.STRING,
        },

    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Customer;
};

