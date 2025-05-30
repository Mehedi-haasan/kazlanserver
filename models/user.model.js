module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        },
        bankname: {
            type: Sequelize.STRING
        },
        accountname: {
            type: Sequelize.STRING
        },
        accountnumber: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        stateId: {
            type: Sequelize.INTEGER,
        },
        compId: {
            type: Sequelize.INTEGER,
        },
        usertype: {
            type: Sequelize.STRING
        },
        cretedby: {
            type: Sequelize.INTEGER
        },
        password: {
            type: Sequelize.STRING
        },
        image_url: {
            type: Sequelize.STRING,
        },

    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    return User;
};

