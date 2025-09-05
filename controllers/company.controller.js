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



exports.BulkUpdate = async (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update."
            });
        }


        for (const item of data) {
            if (!item.id) continue;

            await Company.update(
                { active: item.active }, // ✅ Only update `active` field
                { where: { id: item.id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Attributes updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.BulkGetCompany = async (req, res) => {
    try {
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let allBrand = await Company.findAll({
            limit: pageSize,
            offset: offset,
        })

        return res.status(200).json({
            success: true,
            items: allBrand
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.BulkCreate = async (req, res) => {
    try {
        let { data } = req.body

        await Company.bulkCreate(data);

        return res.status(200).json({
            success: true,
            message: "Updated Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};