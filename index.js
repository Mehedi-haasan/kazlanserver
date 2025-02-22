const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const port = 8050;

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'https://kazalandbrothers.xyz',
            'http://localhost:5173',
            'http://localhost:3001'
        ],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://kazalandbrothers.xyz',
        'http://localhost:5173',
        'http://localhost:3001'
    ],

    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // Ensure "Authorization" is capitalized correctly
    preflightContinue: false,
    optionsSuccessStatus: 204, // Avoids unnecessary redirects
};


app.use(cors(corsOptions));

app.use('/uploads', express.static('uploads'));

const db = require("./models");
require('./routes/user.routes')(app);
require('./routes/ProductTemplate.routes')(app);
require('./routes/company.routes')(app);
require('./routes/imageupload.routes')(app);
require('./routes/payment.routes')(app);
require('./routes/message.routes')(app);
require('./routes/order.routes')(app);
require('./routes/state.routes')(app);
require('./routes/category')(app);
require('./routes/notification.routes')(app);

// db.sequelize.sync({ force: true }).then(async () => {
//     // await initStates();
//     // await initUserRoles();
//     // await initCarousel();
//     // await initCategories();
//     // await initProductAttributes();
//     // await initProductAttributeValues();
// });



const DB = require('./models');
const Message = DB.message;

const socketUserMap = new Map();
const userSocketMap = new Map();

// io.on('connection', (socket) => {


//     socket.on('login', (userId) => {
//         socketUserMap.set(socket.id, userId);
//         userSocketMap.set(userId, socket.id);
//     });

//     socket.on('logout', () => {
//         const userId = socketUserMap.get(socket.id);
//         if (userId) {
//             userSocketMap.delete(userId);
//             socketUserMap.delete(socket.id);
//         }
//     });

//     socket.on('create-message', async (data, callback) => {
//         const { senderId, recieverId, message } = data;


//         try {
//             await Message.create({ senderId, recieverId, message });

//             const receiverSocketId = userSocketMap.get(recieverId);
//             if (receiverSocketId) {
//                 io.to(receiverSocketId).emit('receive-message', { senderId, message });
//             }

//             callback({ status: 'success', message: 'Message sent successfully' });
//         } catch (error) {
//             console.error('Error saving message:', error);
//             callback({ status: 'error', message: 'Could not save message' });
//         }
//     });

//     socket.on('disconnect', () => {
//         const userId = socketUserMap.get(socket.id);
//         if (userId) {
//             userSocketMap.delete(userId);
//             socketUserMap.delete(socket.id);
//         }
//     });
// });

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
