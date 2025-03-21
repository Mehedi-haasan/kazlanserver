const jwt = require('../middleware/authentication');
const controller = require('../controllers/order.controller')
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })

    app.get('/api/get/order', jwt.verifyToken, controller.getAllOrder);
    app.get('/api/get/order/:id', jwt.verifyToken, controller.getOrder);
    app.get('/api/get/order/daily/salse', jwt.verifyToken, controller.getDailySalse);
    app.post('/api/post/order', jwt.verifyToken, controller.CreateOrder);
    app.get('/api/get/user/order/monthly', jwt.verifyToken, controller.getMonthlyOrder);
    app.get('/api/get/order/today', jwt.verifyToken, controller.getTodatOrder);
    app.get('/api/get/user/recent/order/:page', jwt.verifyToken, controller.RecentInvoice);


    app.post('/api/return/sale', jwt.verifyToken, controller.ReturnSale)
    app.post('/api/return/purchase', jwt.verifyToken, controller.ReturnPurchase)
}    