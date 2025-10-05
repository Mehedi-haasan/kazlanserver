const jwt = require('../middleware/authentication');
const controller = require('../controllers/dailysalse.controller')
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })

    app.get('/api/get/order', jwt.verifyToken, controller.getAllOrder);
    app.get('/api/get/invoice/:id', jwt.verifyToken, controller.getSingleInvoice);
    app.get('/api/get/order/:id/:type', jwt.verifyToken, controller.getOrder);
    app.get('/api/get/invo/order/:id/:type', jwt.verifyToken, controller.getOrderInvo);


    app.get('/api/get/order/daily/salse/test', jwt.verifyToken, controller.getDailySalse);
    app.get('/api/get/order/daily/sale/today',jwt.verifyToken, controller.GetTodaySale);
    app.get('/api/get/order/daily/salse/return/pruchase', jwt.verifyToken, controller.getDailySalseReturnPurchase);
    app.get('/api/get/user/order/monthly', jwt.verifyToken, controller.getMonthlyOrder);


    app.get('/api/get/user/recent/order/:page/:pageSize', jwt.verifyToken, controller.RecentInvoice);
    app.post('/api/get/user/recent/purchase/:page/:pageSize', jwt.verifyToken, controller.RecentPurchase);

    app.post('/api/get/user/recent/order/from/to/:page/:pageSize', jwt.verifyToken, controller.OrderFromTo);

    app.post('/api/get/expense', jwt.verifyToken, controller.getExpense);
    app.post('/api/post/expense', jwt.verifyToken, controller.CreateExpense);


    app.post('/api/post/opening/balance', jwt.verifyToken, controller.OpeningBalance);
    app.get('/api/get/opening/balance', jwt.verifyToken, controller.GetOpeningBalance);

}    