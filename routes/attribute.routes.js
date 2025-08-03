const jwt = require('../middleware/authentication')
const controller = require("../controllers/attribute.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/attribute", [jwt.verifyToken, jwt.isAdmin], controller.CreateAttributr);
    app.get("/api/get/attribute/:page/:pageSize", jwt.verifyToken, controller.getAttributrWithPage);
    app.get("/api/get/attribute/filter/search/:name", jwt.verifyToken, controller.searchAttributr);
    app.get("/api/get/attribute", jwt.verifyToken, controller.getAttributrAll);
    app.get("/api/get/all/attribute/by/:type", jwt.verifyToken, controller.getAttributrType);
    app.patch("/api/update/attribute", [jwt.verifyToken, jwt.isAdmin], controller.updateAttributr);
    app.post("/api/delete/attribute", [jwt.verifyToken, jwt.isAdmin], controller.DeleteAttributr);


};