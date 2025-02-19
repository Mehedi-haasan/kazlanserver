module.exports = (sequelize, Sequelize) => {
    const ProductCategory = sequelize.define("category", {
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
        image_url: {
            type: Sequelize.STRING
        }
    });

    return ProductCategory;
};


// CREATE TABLE product_category (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     active BOOLEAN,
//     name VARCHAR(255),
//     image_url VARCHAR(255)
// );
