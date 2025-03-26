const jwt = require('../middleware/authentication')
const controller = require("../controllers/notification.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/get/notification", jwt.verifyToken, controller.getNotification);
    // app.get("/api/get/category", controller.getCategory);
    app.patch("/api/update/notification", controller.updateNotification);


};