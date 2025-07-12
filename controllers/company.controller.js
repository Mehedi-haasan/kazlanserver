const db = require('../models');
const Company = db.company;
const deletePhoto = require('../controllers/filedelete.controller')


exports.CreateInfo = async (req, res) => {
    try {
        const { name, description, email, phone, address, image_url, shopcode, footertext } = req.body;
        if (!req.userId) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized access",
            });
        }

        // Check for existing company with the same name
        const sameName = await db.company.findOne({ where: { name } });
        if (sameName) {
            return res.status(400).send({
                success: false,
                message: "Company with this name already exists.",
            });
        }

        // Check for existing company with the same phone number
        const samePhone = await db.company.findOne({ where: { phone } });
        if (samePhone) {
            return res.status(400).send({
                success: false,
                message: "Company with this phone number already exists.",
            });
        }

        await db.company.create({
            name,
            image_url,
            description,
            email,
            phone,
            address,
            shopcode,
            footertext,
            creator: req?.creator
        });

        return res.status(201).send({
            success: true,
            message: "Company info created successfully",
        });


    } catch (error) {
        console.error("CreateInfo Error:", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


exports.updateInfo = async (req, res) => {
    const values = req.body;

    try {
        await Company.update(values, {
            where: { id: req?.body?.id }
        });


        return res.status(200).send({
            success: true,
            message: 'Company info updated successfully'
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
};


exports.GetCompanyInfo = async (req, res) => {
    try {
        const data = await Company.findOne({
            where: {
                id: req.params?.id
            }
        });
        return res.status(200).send({
            success: true,
            items: data
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};


exports.GetAllCompany = async (req, res) => {
    try {
        const data = await Company.findAll({});
        return res.status(200).send({
            success: true,
            items: data
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};


exports.DeleteCompany = async (req, res) => {
    try {
        const data = await Company.destroy({
            where: {
                id: req.params.id
            }
        });

        return res.status(200).send({
            success: true,
            message: "Shop Delete Successfully"
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};
