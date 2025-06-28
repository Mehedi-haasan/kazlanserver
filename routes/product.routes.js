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

    app.post("/api/update/single/product", [Jwt.verifyToken, Jwt.isAdmin], controller.updateSingleProduct);

    app.get("/api/get/single/product/tran/:id", [Jwt.verifyToken, Jwt.isAdmin], controller.SingleProductTran);

    app.get("/api/get/product/templete/:page/:pageSize/:brandId/:catId/:compId", Jwt.verifyToken, controller.getProductTemplete);

    app.get("/api/get/product/search/:id", controller.SingleProduct);

    app.get("/api/get/product/:id", Jwt.verifyToken, controller.searchProduct);

    app.post("/api/delete/product", [Jwt.verifyToken, Jwt.isAdmin], controller.DeleteProduct);

    app.get("/api/get/product/search/with/:name", Jwt.verifyToken, controller.searchProduct);

    app.get("/api/get/product/search/with/:edition/:category/:brand/:name", Jwt.verifyToken, controller.SecondSearchProduct);

};