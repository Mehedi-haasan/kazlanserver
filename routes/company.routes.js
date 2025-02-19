const jwt = require('../middleware/authentication');
const controller = require('../controllers/company.controller')
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })

    app.post('/api/create/company/info', jwt.verifyToken, controller.CreateInfo);
    app.post('/api/update/company/info', jwt.verifyToken, controller.updateInfo);
    app.get('/api/get/company/info', controller.GetCompanyInfo);
}