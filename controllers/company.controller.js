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

        await db.company.create({
            name,
            image_url,
            description,
            email,
            phone,
            address,
            shopcode,
            footertext,
            creator:req?.creator
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
    const { id, userId, name, description, email, phone, address, image_url, update_url, shopcode, footertext } = req.body;

    try {
        const [updated] = await Company.update({
            userId,
            name,
            description,
            image_url,
            email,
            phone,
            address,
            shopcode,
            footertext,
            creator:req?.creator
        },
            {
                where: {
                    id: id
                }
            });

        if (updated) {
            deletePhoto(update_url)
            res.status(200).send({
                success: true,
                message: 'Company info updated successfully'
            });
        } else {
            res.status(404).send({
                success: false,
                message: 'Company not found'
            });
        }
    } catch (error) {
        res.status(500).send({
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
        res.status(200).send({
            success: true,
            items: data
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};


exports.GetAllCompany = async (req, res) => {
    try {
        const data = await Company.findAll({});
        res.status(200).send({
            success: true,
            items: data
        });
    } catch (error) {
        res.status(500).send({
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

        res.status(200).send({
            success: true,
            message: "Shop Delete Successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};
