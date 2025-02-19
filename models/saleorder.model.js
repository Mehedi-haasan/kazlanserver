module.exports = (sequelize, Sequelize) => {
    const saleorder = sequelize.define("saleorder", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        invoice_id: {
            type: Sequelize.INTEGER,
        },
        product_id: {
            type: Sequelize.INTEGER,
        },
        username: {
            type: Sequelize.STRING,
        },
        userId: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.INTEGER,
        },
        discount: {
            type: Sequelize.INTEGER,
        },
        discountType: {
            type: Sequelize.STRING,
        },
        discountamount: {
            type: Sequelize.STRING,
        },
        sellprice: {
            type: Sequelize.INTEGER,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
        contact: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.STRING
        },
    });

    return saleorder;
};



// CREATE TABLE saleorder (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     active BOOLEAN DEFAULT TRUE,
//     invoice_id INT,
//     product_id INT,
//     username VARCHAR(255),
//     userId INT,
//     name VARCHAR(255),
//     price INT,
//     discount INT,
//     discountType VARCHAR(255),
//     sellprice INT,
//     qty INT,
//     contact VARCHAR(255),
//     date VARCHAR(255)
// );
