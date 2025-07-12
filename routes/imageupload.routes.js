const Jwt = require("../middleware/authentication");
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const upload = require('../multer/Upload')
const BaseUrl = "https://portal.kazalandbrothers.xyz";
// const BaseUrl = "http://localhost:8050";
const deletePhoto = require('../controllers/filedelete.controller')


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


    app.post('/upload/excel', upload.single('excel'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const filePath = req.file.path;
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null }); 
            deletePhoto(filePath); 

            res.json({
                success: true,
                count: jsonData.length,
                data: jsonData
            });

        } catch (err) {
            console.error('Error processing file:', err);
            res.status(500).json({ success: false, message: 'Error reading Excel file' });
        }
    });



};