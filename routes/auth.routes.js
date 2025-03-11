const jwt = require('../middleware/authentication')
const controller = require("../controllers/auth.controller");
const deletePhoto = require('../controllers/filedelete.controller')

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    app.post("/api/auth/signin", controller.singIn);
    app.post("/api/auth/signup", [jwt.verifyToken, jwt.isAdmin], controller.singUp);
    app.post("/api/forget/password", controller.ForgetPassword);
    app.post("/api/otp/varification", controller.OtpVarification);
    
    app.get("/", (req, res) => {
        res.status(200).send({
            success: true,
            message: "Deploy Successfulll",
        });
    });
    app.get("/delete", (req, res) => {
        deletePhoto('1741675917207-book.png')
        res.status(200).send({
            success: true,
            message: "Delete Successfulll",
        });
    });
};