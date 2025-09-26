module.exports = (sequelize, Sequelize) => {
    const AttributeValue = sequelize.define("attributevalue", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
        },
        attr_id: {
            type: Sequelize.INTEGER
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

    return AttributeValue;
};


