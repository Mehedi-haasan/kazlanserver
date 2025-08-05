const db = require("../models");
const Attribute = db.attribute;
const Op = db.Sequelize.Op;

exports.getAttributrAll = async (req, res) => {
    try {
        let data = await Attribute.findAll({
            attributes: ['id', 'name'],
            where: { compId: req?.compId, active: true },
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

exports.getAttributrType = async (req, res) => {
    try {
        let data = await Attribute.findAll({
            attributes: ['id', 'name'],
            where: { compId: req?.compId, type: req.params.type, active: true },
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

exports.getAttributrWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await Attribute.findAll({
            where: { compId: req?.compId, active: true },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        })
        const totalCount = await Attribute.count({
            where: {
                compId: req?.compId
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



exports.searchAttributr = async (req, res) => {
    const searchTerm = req.params.name;
    try {
        let data = await Attribute.findAll({
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




exports.CreateAttributr = async (req, res) => {

    try {
        const data = await Attribute.findOne({
            where: {
                name: req.body.name,
                compId: req.compId
            }
        })

        if (data) {
            return res.status(200).send({
                success: true,
                message: "Attribute already exist"
            })
        }

        await Attribute.create({
            active: true,
            type: req.body.type,
            name: req.body.name,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        });

        return res.status(200).send({
            success: true,
            message: "Attribute Created Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.updateAttributr = async (req, res) => {
    try {
        const { id, type, name } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Order ID and status are required."
            });
        }


        const [updatedRowsCount] = await Attribute.update(
            { name: name, type: type, creator: req.user },
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
            message: `Attribute Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.DeleteAttributr = async (req, res) => {
    try {

        await Attribute.update({
            active: false,
            name: req.body.name,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        }, {
            where: {
                id: req.body.id
            }
        })

        return res.status(200).send({
            success: true,
            message: "Attribute deleted successfully.",
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

            await Attribute.update(
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



exports.BulkGetAttribute = async (req, res) => {
    try {
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let allBrand = await Attribute.findAll({
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

        await Attribute.bulkCreate(data);

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