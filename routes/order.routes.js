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

    app.get('/api/get/order', controller.getAllOrder);
    app.get('/api/get/order/:id', controller.getOrder);
    app.get('/api/get/order/daily/salse', controller.getDailySalse);
    app.post('/api/post/order', controller.CreateOrder);
    app.get('/api/get/user/order/monthly',  controller.getMonthlyOrder);
    app.get('/api/get/order/today', controller.getTodatOrder);

    
    app.get('/api/get/user/order/:tran_id', jwt.verifyToken, controller.getYearlyOrder);
}