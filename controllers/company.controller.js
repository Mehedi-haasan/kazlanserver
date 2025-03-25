const db = require('../models');
const Company = db.company;


exports.CreateInfo = async (req, res) => {
    const { name, description, email, phone, address, footertext } = req.body;
    console.log("Hitting", name, description, email, phone, address, footertext)
    try {
        await db.company.create({
            userId: 2,
            name: name,
            description: description,
            image_url: image_url,
            email: email,
            phone: phone,
            address: address,
            footertext: footertext
        })
        res.status(200).send({
            success: true,
            message: 'Company info creted successfully'
        })

    } catch (error) {
        res.status(500).send({
            success: true,
            message: error
        })
    }
}

exports.updateInfo = async (req, res) => {
    const { userId, name, description, email, phone, address, footertext } = req.body;

    try {
        const [updated] = await Company.update({
            userId,
            name,
            description,
            image_url,
            email,
            phone,
            address,
            footertext
        },
            {
                where: {
                    userId: req?.userId
                }
            });

        if (updated) {
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
                userId: req.userId
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