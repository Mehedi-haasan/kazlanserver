module.exports = (sequelize, Sequelize) => {
    const Brand = sequelize.define("brand", {
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

    return Brand;
};


// CREATE TABLE product_category (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     active BOOLEAN,
//     name VARCHAR(255),
//     image_url VARCHAR(255)
// );
