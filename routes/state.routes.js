const jwt = require('../middleware/authentication')
const controller = require("../controllers/state.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/create/state", controller.CreateState);
    app.get("/api/get/state", controller.getState);
    app.get("/api/get/state/with/user", controller.getStateWithUser);
    app.delete("/api/delete/state/:id", controller.DeleteState);

};