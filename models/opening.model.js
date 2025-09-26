module.exports = (sequelize, Sequelize) => {
    const Opening = sequelize.define("opening", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
        },
        type: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        compId: {
            type: Sequelize.INTEGER
        },
        createdby: {
            type: Sequelize.INTEGER
        },
        creator: {
            type: Sequelize.STRING
        }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Opening;
};


