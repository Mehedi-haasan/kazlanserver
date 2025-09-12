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

    app.get("/api/get/customers/:page/:pageSize/:customertype", [jwt.verifyToken], controller.GetCustomerWithPage);
    app.get("/api/get/suppliers/:page/:pageSize", [jwt.verifyToken], controller.GetSupplierWithPage);


    app.get("/api/get/customers/:stateId", [jwt.verifyToken], controller.GetCustomerWithState);
    app.get("/api/get/suppliers/:stateId", [jwt.verifyToken], controller.GetSupplierWithState);


    app.post("/api/search/customers", [jwt.verifyToken], controller.SearchCustomer);


    app.post("/api/update/customer/balance/:id/:type", [jwt.verifyToken, jwt.isAdmin], controller.UpdateCustomerBalance);




    app.post("/api/update/customer/:id", [jwt.verifyToken, jwt.isAdmin], controller.UpdateCustomer);
    app.post("/api/update/supplier/:id", [jwt.verifyToken, jwt.isAdmin], controller.UpdateSupplier);
    app.get("/api/get/customer/:id", [jwt.verifyToken, jwt.isAdmin], controller.GetSingleCustomer);




    app.get("/api/get/retail/customers/:page/:pageSize", [jwt.verifyToken], controller.RetailerCustomer);
    app.get("/api/get/retail/customers/:stateId", [jwt.verifyToken], controller.GetRetailerCustomer);



    app.get("/api/get/customer/due/:userId", [jwt.verifyToken], controller.GetCustomerDue);


    app.post("/api/get/payment/history/:id", [jwt.verifyToken], controller.PaymentHistory);

    app.delete("/api/delete/customer/:id", [jwt.verifyToken], controller.DeleteCustomer);



    app.post("/api/bulk/update/customer", [jwt.verifyToken, jwt.isAdmin], controller.BulkUpdate);

    app.post("/api/bulk/create/customer", [jwt.verifyToken, jwt.isAdmin], controller.BulkCreate);

    app.post("/api/bulk/get/customer", [jwt.verifyToken, jwt.isAdmin], controller.BulkGetCustomer);

};