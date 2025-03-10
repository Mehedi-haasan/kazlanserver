module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("category", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
        },
        name: {
            type: Sequelize.STRING
        },
        createdby: {
            type: Sequelize.INTEGER
        },
        image_url: {
            type: Sequelize.STRING
        }
    });

    return Category;
};

