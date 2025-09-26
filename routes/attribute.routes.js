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


    // Attribute Type
    app.post("/api/create/attribute/type", [jwt.verifyToken, jwt.isAdmin], controller.CreateAttributeType);
    app.get("/api/get/attribute/type", [jwt.verifyToken, jwt.isAdmin], controller.GetAttributeTypeAll);
    app.get("/api/get/attribute/tree", jwt.verifyToken, controller.GetAttributeTree);


    // Attribute Name
    app.post("/api/create/attribute", [jwt.verifyToken, jwt.isAdmin], controller.CreateAttributeName);
    app.get("/api/get/attribute/:page/:pageSize", jwt.verifyToken, controller.GetAttributeWithPage);
    app.get("/api/get/attribute", jwt.verifyToken, controller.GetAttributeAll);
    app.get("/api/get/single/attribute/:id", jwt.verifyToken, controller.GetSingleAttribute);

    app.get("/api/get/attribute/filter/search/:name", jwt.verifyToken, controller.searchAttributr);
    app.get("/api/get/all/attribute/by/:attr_type_id", jwt.verifyToken, controller.getAttributeByType);
    app.patch("/api/update/attribute", [jwt.verifyToken, jwt.isAdmin], controller.updateAttributr);
    app.post("/api/delete/attribute", [jwt.verifyToken, jwt.isAdmin], controller.DeleteAttributr);

    // Attribute Value
    app.post("/api/create/attribute/value", [jwt.verifyToken, jwt.isAdmin], controller.CreateAttributeValue);
    app.get("/api/get/attribute/value/by/:attr_id", [jwt.verifyToken, jwt.isAdmin], controller.GetAttributeValueByAttrId);

    app.post("/api/bulk/update/attribute", [jwt.verifyToken, jwt.isAdmin], controller.BulkUpdate);
    app.post("/api/bulk/create/attribute", [jwt.verifyToken, jwt.isAdmin], controller.BulkCreate);
    app.post("/api/bulk/get/attribute", [jwt.verifyToken, jwt.isAdmin], controller.BulkGetAttribute);

};