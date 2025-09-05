const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require('cors');
const app = express();
const port = 8050;
const db = require('./models');

const http = require('http');
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3000", "https://kazalandbrothers.xyz"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
    credentials: true,
}));

app.use('/uploads', express.static('uploads'));


require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/product.routes')(app);
require('./routes/company.routes')(app);
require('./routes/imageupload.routes')(app);
require('./routes/payment.routes')(app);
require('./routes/message.routes')(app);
require('./routes/order.routes')(app);
require('./routes/dailysalse.routes')(app);
require('./routes/state.routes')(app);
require('./routes/category.routes')(app);
require('./routes/brand.routes')(app);
require('./routes/notification.routes')(app);
require('./routes/customer.routes')(app);
require('./routes/attribute.routes')(app);


// db.sequelize.sync({ force: false }).then(async () => {
//     await initStates();
//     // await initUserRoles();
//     // await initCarousel();
//     // await initCategories();
//     // await initProductAttributes();
//     // await initProductAttributeValues();
// });

const initStates = async () => {
    await db.state.create({
        name: "Madaripur Sadar",
    });
    // await db.category.create({
    //     name: "Book",
    //     active: true,
    //     image_url: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
    //     compId: 1,
    //     createdby: 1,
    //     creator: "Mahfuzur Rahman",
    // });
    // await db.brand.create({
    //     name: "Matadoor",
    //     active: true,
    //     compId: 1,
    //     image_url: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
    //     createdby: 1,
    //     creator: "Mahfuzur Rahman",
    // });
    await db.user.create({
        name: "Mahfuzur Rahman",
        active: true,
        username: "01782205566",
        whatsapp: "01782205566",
        address: "Dhaka Uttara",
        bankname: "City Bank",
        accountname: "KazlandBrother",
        accountnumber: "01782205566",
        email: "kazalandbrother@gmail.com",
        stateId: 1,
        compId: 1,
        usertype: "Wholesaler",
        cretedby: 1,
        creator: "Mahfuzur Rahman",
        password: bcrypt.hashSync("1234560", 8),
        image_url: "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
    })
    // await db.customer.create({
    //     name: "Random Customer",
    //     phone: "1234567890",
    //     bankname: "City Bank",
    //     accountname: "Random Customer",
    //     accountnumber: "1234567890",
    //     compId: 0,
    //     balance: 0,
    //     address: "Random",
    //     email: "randomcustomer@gmail.com",
    //     stateId: 1,
    //     usertype: "Customer",
    //     cretedby: 1,
    //     creator: "Mahfuzur Rahman",
    //     image_url: "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
    // })
    await db.role.create({
        userId: 1,
        name: 'superadmin'
    })
    await db.role.create({
        userId: 1,
        name: 'admin'
    })
    await db.company.create({
        name: "Kazal and Brothers",
        image_url: "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
        description: "Description",
        email: "kazalandbrother@gmail.com",
        phone: "1234567890",
        address: "Madaripur",
        shopcode: "KB",
        footertext: "Copyright© Kazlandbrothers",
        creator: "Mahfuzur Rahman"
    })

    // await db.customer.create({
    //     name: "Lecture Publication",
    //     phone: "123456",
    //     bankname: "City Bank",
    //     accountname: "Lecture Publication",
    //     accountnumber: "123456",
    //     balance: 0,
    //     balance_type: "To Pay",
    //     address: "Madaripur",
    //     email: "lecturepublication@gmail.com",
    //     stateId: 1,
    //     compId: 1,
    //     usertype: "Supplier",
    //     cretedby: 1,
    //     creator: "Mahfuzur Rahman",
    //     image_url: "",
    //     customertype: "Party"
    // })
    // await db.customer.create({
    //     name: "Mehedi hasan",
    //     phone: "123456",
    //     bankname: "City Bank",
    //     accountname: "Mehedi hasan",
    //     accountnumber: "123456",
    //     balance: 0,
    //     balance_type: "To Pay",
    //     address: "Madaripur",
    //     email: "hasanmehedi@gmail.com",
    //     stateId: 1,
    //     compId: 1,
    //     usertype: "Customer",
    //     cretedby: 1,
    //     creator: "Mahfuzur Rahman",
    //     image_url: "",
    //     customertype: "Party"
    // })

    // await db.product.create({
    //     active: true,
    //     product_type: "Physical",
    //     categoryId: 1,
    //     editionId: 1,
    //     compId: 1,
    //     supplier: 1,
    //     name: "Class 10 Physics",
    //     code: '101',
    //     description: "Class 10 Physics",
    //     image_url: "",
    //     cost: 180,
    //     price: 180,
    //     edition: "2025",
    //     year: "2025",
    //     brandId: 1,
    //     createdby: 1,
    //     creator: "Mahfuzur Rahman",
    //     qty: 100,
    //     qty_type: "Pcs",
    //     discount: 0,
    //     discount_type: "Percentage"
    // })
}


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
