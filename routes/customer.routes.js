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



    app.get("/api/get/wholesell/customers/", [jwt.verifyToken], controller.WholesellCustomer);
    app.get("/api/get/wholesell/customers/:stateId", [jwt.verifyToken], controller.GetWholesellCustomer);



    app.get("/api/get/retail/customers", [jwt.verifyToken], controller.RetailerCustomer);
    app.get("/api/get/retail/customers/:stateId", [jwt.verifyToken], controller.GetRetailerCustomer);


    app.get("/api/get/suppliers", [jwt.verifyToken], controller.GetSupplier);

    app.get("/api/get/customer/due/:userId", [jwt.verifyToken], controller.GetCustomerDue);

};