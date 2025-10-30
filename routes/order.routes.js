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


    app.post('/api/edit/sale/order', jwt.verifyToken, controller.EditSaleOrder);
    app.post('/api/edit/sale/return', jwt.verifyToken, controller.EditSaleReturn);
    
    app.post('/api/edit/purchase/order', jwt.verifyToken, controller.EditPurchaseOrder);
    app.post('/api/edit/purchase/return', jwt.verifyToken, controller.EditPurchaseReturn);

    app.get('/api/search/data/:name', jwt.verifyToken, controller.SearchOrder);


    app.get('/api/get/offline/data', jwt.verifyToken, controller.GetOfflineData);
    app.post('/api/postget/offline/data', jwt.verifyToken, controller.OfflineToOnline)
    app.delete('/api/delete/offline/data', jwt.verifyToken, controller.DeleteLocalData)


    app.post('/api/invoice/recalculate', jwt.verifyToken, controller.recalculateNextInvoices);

}    