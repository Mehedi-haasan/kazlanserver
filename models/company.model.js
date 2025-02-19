module.exports = (sequelize, Sequelize) => {
    const Company = sequelize.define("company", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        fb_url: {
            type: Sequelize.STRING,
        },
        yu_url: {
            type: Sequelize.STRING,
        },
        wh_url: {
            type: Sequelize.STRING,
        },
        tw_url: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        email2: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        phone2: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.STRING,
        },
    });

    return Company;
};