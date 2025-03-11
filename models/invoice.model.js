module.exports = (sequelize, Sequelize) => {
    const Invoice = sequelize.define("invoice", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: Sequelize.STRING
        },
        shop: {
            type: Sequelize.STRING
        },
        createdby: {
            type: Sequelize.INTEGER
        },
        userId: {
            type: Sequelize.INTEGER
        },
        total: {
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
        }
    });

    return Invoice;
};

