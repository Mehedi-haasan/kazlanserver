module.exports = (sequelize, Sequelize) => {
    const AttributeType = sequelize.define("attributetype", {
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
        name: {
            type: Sequelize.STRING
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

    return AttributeType;
};


