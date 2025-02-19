const jwt = require('../middleware/authentication')
const controller = require("../controllers/category");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/category", controller.CreateCategory);
    app.get("/api/get/category", controller.getCategory);
    app.get("/api/get/category/by/productValue", controller.getCategoryByProduct);
    app.patch("/api/update/category", controller.updateCategory);
    app.delete("/api/delete/category/by/:id", controller.DeleteCategory);

};