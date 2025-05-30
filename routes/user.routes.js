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
    app.get("/api/get/users/with/role/:page/:pageSize", [jwt.verifyToken], controller.getUsersWithRole);
    app.get("/api/get/users/:stateId", [jwt.verifyToken], controller.getUsersbyState);


    app.get("/api/get/single/users", [jwt.verifyToken], controller.getSingleUsers);
    app.patch("/api/update/single/users", [jwt.verifyToken], controller.updateUsers);
    app.patch("/api/update/user/password", [jwt.verifyToken], controller.ChangePassword);
    app.get("/api/get/shop", [jwt.verifyToken], controller.getShop);
    app.get("/api/get/shop/list/with/info/:page/:pageSize", [jwt.verifyToken, jwt.isSuperAdmin], controller.getShopList);
};