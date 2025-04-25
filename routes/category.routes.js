const jwt = require('../middleware/authentication')
const controller = require("../controllers/category.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/category", [jwt.verifyToken, jwt.isAdmin], controller.CreateCategory);
    app.get("/api/get/category/:page/:pageSize",jwt.verifyToken, controller.getCategory);
    app.get("/api/get/category",jwt.verifyToken, controller.getCategoryAll);
    app.get("/api/get/category/by/productValue", controller.getCategoryByProduct);
    app.patch("/api/update/category", [jwt.verifyToken, jwt.isAdmin], controller.updateCategory);
    app.post("/api/delete/category", [jwt.verifyToken, jwt.isAdmin], controller.DeleteCategory);
    app.get("/api/get/category/filter/search/:name", jwt.verifyToken, controller.SearchCategory);

};