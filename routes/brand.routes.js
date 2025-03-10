const jwt = require('../middleware/authentication')
const controller = require("../controllers/brand.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/brand", [jwt.verifyToken, jwt.isAdmin], controller.CreateBrand);
    app.get("/api/get/brand", controller.getBrand);
    app.patch("/api/update/brand", [jwt.verifyToken, jwt.isAdmin], controller.updateBrand);


};