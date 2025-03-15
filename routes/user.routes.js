const jwt = require('../middleware/authentication')
const controller = require("../controllers/user.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/get/users", [jwt.verifyToken], controller.getUsers);
    app.get("/api/get/users/:stateId",[jwt.verifyToken], controller.getUsersbyState);

    
    app.get("/api/get/single/users", [jwt.verifyToken], controller.getSingleUsers);
    app.patch("/api/update/single/users", [jwt.verifyToken], controller.updateUsers);
    app.get("/api/users/due/:id", controller.UserDue);
    app.patch("/api/users/due/update", controller.UserDueCreate);


    app.get("/api/get/customer", [jwt.verifyToken], controller.getCustomer);
    app.get("/api/get/supplier", [jwt.verifyToken], controller.getSupplier);
    app.get("/api/get/shop", [jwt.verifyToken], controller.getShop);
    app.get("/api/get/shop/list/with/info",  controller.getShopList);
};