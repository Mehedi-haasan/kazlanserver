const Jwt = require("../middleware/authentication");
const upload = require('../multer/Upload')

const controller = require("../controllers/product.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/product", [Jwt.verifyToken, Jwt.isAdmin], controller.createProduct);
    app.post("/api/update/product", [Jwt.verifyToken, Jwt.isAdmin], controller.UpdateProduct);
    app.get("/api/get/product/templete/:page/:pageSize", Jwt.verifyToken, controller.getProductTemplete);
    app.get("/api/get/product/search/:product", controller.searchProduct);
    app.post("/api/delete/product", [Jwt.verifyToken, Jwt.isAdmin], controller.DeleteProduct);

};