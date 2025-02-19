const db = require('../models');
const Company = db.company;


exports.CreateInfo = async (req, res) => {
    const { name, description, fb_url, yu_url, wh_url, tw_url, email, email2, phone, phone2, address } = req.body;

    try {
        await Company.create({
            name,
            description,
            fb_url,
            yu_url,
            wh_url,
            tw_url,
            email,
            email2,
            phone,
            phone2,
            address
        })
        res.status(200).send({
            success: true,
            message: 'Company info creted successfully'
        })

    } catch (error) {
        res.status(500).send({
            success: true,
            message: 'Internal server error'
        })
    }
}

exports.updateInfo = async (req, res) => {
    const { name, description, fb_url, yu_url, wh_url, tw_url, email, email2, phone, phone2, address } = req.body;

    try {
        const [updated] = await Company.update({
            name,
            description,
            fb_url,
            yu_url,
            wh_url,
            tw_url,
            email,
            email2,
            phone,
            phone2,
            address
        },
            {
                where: {
                    id: 1
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
        const data = await Company.findOne(); // Retrieves the first entry in the Company table
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