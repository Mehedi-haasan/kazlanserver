const fs = require('fs');
const path = require('path');

const deletePhoto = (url) => {
    const filename = path.basename(url);
    const filePath = path.join(__dirname, '../uploads', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
        } else {
            console.log("File deleted successfully:", filePath);
        }
    });


};

module.exports = deletePhoto;
