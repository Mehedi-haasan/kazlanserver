const db = require("../models");
const Brand = db.brand;
const Op = db.Sequelize.Op;
const deletePhoto = require('../controllers/filedelete.controller');

exports.getBrandAll = async (req, res) => {
    try {
        let data = await Brand.findAll({
            attributes: ['id', 'name', 'image_url'],
            where: { compId: req?.compId, active: true, },
            order: [['createdAt', 'DESC']],
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.GetSingleBrand = async (req, res) => {
    try {
        let data = await Brand.findOne({
            where: { id: req?.params.id, active: true, },
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.getBrandWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await Brand.findAll({
            where: { compId: req?.compId, active: true },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        })
        const totalCount = await Brand.count({
            where: {
                compId: req?.compId,
                active: true
            }
        });

        return res.status(200).send({
            success: true,
            items: data,
            count: totalCount
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.searchBrand = async (req, res) => {
    const searchTerm = req.params.name;
    try {
        let data = await Brand.findAll({
            where: {
                name: { [Op.like]: `%${searchTerm}%` },
                compId: req?.compId,
                active: true,
            }
        });

        return res.status(200).send({
            success: true,
            items: data,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}




exports.CreateBrand = async (req, res) => {

    try {
        const data = await Brand.findOne({
            where: {
                name: req.body.name,
                compId: req.body.compId ? req.body.compId : req.compId
            }
        })

        if (data) {
            return res.status(200).send({
                success: true,
                message: "Brand already exist"
            })
        }

        await Brand.create({
            active: true,
            name: req.body.name,
            image_url: req.body.image_url,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        });

        return res.status(200).send({
            success: true,
            message: "Brand Created Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.updateBrand = async (req, res) => {
    try {
        const { id, name, image_url } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Order ID and status are required."
            });
        }


        const [updatedRowsCount] = await Brand.update(
            { name: name, image_url: image_url, creator: req.user },
            { where: { id: id } }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).send({
                success: false,
                message: "Order not found or status is already the same."
            });
        }
        return res.status(200).send({
            success: true,
            message: `Brand Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.DeleteBrand = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Brand ID is required."
            });
        }

        await Brand.update({
            active: false,
            name: req.body.name,
            image_url: req.body.image_url,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        }, {
            where: {
                id: req.body.id
            }
        })


        // deletePhoto(url)
        return res.status(200).send({
            success: true,
            message: "Brand deleted successfully.",
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
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

            await Brand.update(
                { active: item.active }, // ✅ Only update `active` field
                { where: { id: item.id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Brands updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.BulkGetBrand = async (req, res) => {
    try {
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let allBrand = await Brand.findAll({
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

        await Brand.bulkCreate(data);

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