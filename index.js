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


// db.sequelize.sync({ force: true }).then(async () => {
//     await initStates();
// });

const initStates = async () => {
    await db.state.create({
        active:true,
        name: "Madaripur Sadar",
    });

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

    await db.role.create({
        userId: 1,
        name: 'superadmin'
    })
    await db.role.create({
        userId: 1,
        name: 'admin'
    })
    await db.company.create({
        active:true,
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
}


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
