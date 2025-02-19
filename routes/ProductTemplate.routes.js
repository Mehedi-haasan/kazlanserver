const Jwt = require("../middleware/authentication");
const upload = require('../multer/Upload')

const controller = require("../controllers/productTemplete.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/product", controller.createProduct);


    app.patch("/api/update/product", controller.UpdateProduct);

    app.get("/api/get/product/templete", controller.getProductTemplete);
    app.get("/api/get/product/search/:product", controller.searchProduct);

    // app.get("/api/get/product", controller.getProductVariant);


    // app.get("/api/get/single/product/variant/:id", controller.getProductSingleVariant);
  
    // app.get("/api/get/product/trending", controller.getTrendingProduct);
  
    // app.get("/api/get/product/templete/by/category/:id", controller.getProductTempleteByCategory);
    // app.get("/api/get/product/variant/:id", controller.getProductVariant);
    // app.delete("/api/delete/product/",Jwt.verifyToken, controller.DeleteProductTemplate);

};