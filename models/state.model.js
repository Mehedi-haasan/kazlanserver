module.exports = (sequelize, Sequelize) => {
    const State = sequelize.define("state", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING
        },
        cretedby:{
            type: Sequelize.INTEGER
        }
    });

    return State;
};

