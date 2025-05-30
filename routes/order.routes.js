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


    app.post('/api/post/order', jwt.verifyToken, controller.CreateOrder);
    app.post('/api/return/sale', jwt.verifyToken, controller.ReturnOrder)


    app.post("/api/purchase/product", [jwt.verifyToken, jwt.isAdmin], controller.PurchaseProduct);
    app.post('/api/return/purchase', jwt.verifyToken, controller.ReturnPurchase)

}    