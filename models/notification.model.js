module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define("notification", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        isSeen: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING,
        },
        userId: {
            type: Sequelize.INTEGER
        },
        invoiceId: {
            type: Sequelize.INTEGER
        },
        createdby: {
            type: Sequelize.INTEGER
        }
    });

    return Notification;
};

