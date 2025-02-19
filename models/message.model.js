module.exports = (sequelize, Sequelize) => {
    const Message = sequelize.define("message", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
        },
        senderId: {
            type: Sequelize.INTEGER
        },
        recieverId: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.STRING
        }
    });

    return Message;
};
