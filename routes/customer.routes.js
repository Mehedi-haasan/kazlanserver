const jwt = require('../middleware/authentication')
const controller = require("../controllers/customer.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/customers", [jwt.verifyToken], controller.CreateCustomer);


    app.post("/api/update/customer/:id", [jwt.verifyToken, jwt.isAdmin], controller.UpdateCustomer);
    app.post("/api/update/supplier/:id", [jwt.verifyToken,jwt.isAdmin], controller.UpdateSupplier);


    app.get("/api/get/wholesell/customers/:page/:pageSize", [jwt.verifyToken], controller.WholesellCustomer);
    app.get("/api/get/wholesell/customers/:stateId", [jwt.verifyToken], controller.GetWholesellCustomer);
    



    app.get("/api/get/retail/customers/:page/:pageSize", [jwt.verifyToken], controller.RetailerCustomer);
    app.get("/api/get/retail/customers/:stateId", [jwt.verifyToken], controller.GetRetailerCustomer);


    app.get("/api/get/suppliers/:page/:pageSize", [jwt.verifyToken], controller.GetSupplier);
    app.get("/api/get/customer/due/:userId", [jwt.verifyToken], controller.GetCustomerDue);


    app.get("/api/get/payment/history/:id", [jwt.verifyToken], controller.PaymentHistory);

};