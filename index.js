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

app.use(cors());

app.use('/uploads', express.static('uploads'));


require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/product.routes')(app);
require('./routes/company.routes')(app);
require('./routes/imageupload.routes')(app);
require('./routes/payment.routes')(app);
require('./routes/message.routes')(app);
require('./routes/order.routes')(app);
require('./routes/state.routes')(app);
require('./routes/category.routes')(app);
require('./routes/brand.routes')(app);
require('./routes/notification.routes')(app);


// db.sequelize.sync({ force: false }).then(async () => {
//     // await initStates();
//     // await initUserRoles();
//     // await initCarousel();
//     // await initCategories();
//     // await initProductAttributes();
//     // await initProductAttributeValues();
// });

const initStates = async () => {
    await db.state.create({
        name: "Dhaka",
        cretedby: 1
    });
    await db.category.create({
        name: "Book",
        image_url: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
        createdby: 1
    });
    await db.brand.create({
        name: "Matadoor",
        image_url: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
        createdby: 1
    });
    await db.user.create({
        first_name: "Mahfuzur",
        last_name: "Rahman",
        username: "01782205566",
        whatsapp: "1234567890",
        address: "Dhaka Uttara",
        email: "mahfuzur1316@gmail.com",
        stateId: 1,
        usertype: "customer",
        cretedby: 1,
        password: bcrypt.hashSync("1234560", 8),
        image_url: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
    })
    await db.role.create({
        userId: 1,
        name: 'admin'
    })
}


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
