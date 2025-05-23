const Jwt = require("../middleware/authentication");
const upload = require('../multer/Upload')
// const BaseUrl = "https://portal.kazalandbrothers.xyz";
const BaseUrl = "http://localhost:8050";


module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/upload/image", Jwt.verifyToken, upload.single('image_url'), async (req, res) => {
        try {
            const image_url = req.file;

            if (!image_url) {
                return res.status(400).send({
                    success: false,
                    message: "No file uploaded."
                });
            }

            res.status(200).send({
                success: true,
                image_url: `${BaseUrl}/uploads/${image_url.filename}`
            });

        } catch (error) {
            res.status(500).send({
                success: false,
                message: "An error occurred while uploading the image.",
                error: error.message
            });
        }
    });




    app.post("/api/upload/image/register", upload.single('image_url'), async (req, res) => {
        try {
            const image_url = req.file;
            if (!image_url) {
                return res.status(400).send({
                    success: false,
                    message: "No file uploaded."
                });
            }

            res.status(200).send({
                success: true,
                image_url: `${BaseUrl}/uploads/${image_url.filename}`
            });
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "An error occurred while uploading the image.",
                error: error.message
            });
        }
    });


};