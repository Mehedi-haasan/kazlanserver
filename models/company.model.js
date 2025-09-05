module.exports = (sequelize, Sequelize) => {
    const Company = sequelize.define("company", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        name: {
            type: Sequelize.STRING,
        },
        image_url: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.STRING,
        },
        footertext: {
            type: Sequelize.STRING,
        },
        shopcode: {
            type: Sequelize.STRING,
        },
        creator: {
            type: Sequelize.STRING
        }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return Company;
};