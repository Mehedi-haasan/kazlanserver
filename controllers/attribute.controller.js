const db = require("../models");
const Attribute = db.attribute;
const Op = db.Sequelize.Op;



exports.CreateAttributeType = async (req, res) => {

    try {
        await db.attributetype.create({
            active: true,
            type: req.body.type,
            name: req.body.name,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        });

        return res.status(200).send({
            success: true,
            message: "Attribute Type Created Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

exports.GetAttributeTypeAll = async (req, res) => {
    try {
        let data = await db.attributetype.findAll({
            attributes: ['id', 'name'],
            where: {
                active: true
            },
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


exports.CreateAttributeName = async (req, res) => {

    try {

        await Attribute.create({
            active: true,
            attr_type_id: req.body.attr_type_id,
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

exports.GetAttributeWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await Attribute.findAll({
            where: { active: true },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: [{
                model: db.attributevalue,
            }]
        })
        const totalCount = await Attribute.count({
            where: {
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

exports.GetAttributeTree = async (req, res) => {
    try {
        let data = await db.attributetype.findAll({
            where: { active: true },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: db.attribute,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: db.attributevalue,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.GetAttributeAll = async (req, res) => {
    try {
        let data = await Attribute.findAll({
            attributes: ['id', 'name'],
            where: { active: true },
            order: [
                ['createdAt', 'DESC'], // existing order
                ['name', 'ASC']        // new order by name
            ],
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.GetSingleAttribute = async (req, res) => {
    try {
        let data = await Attribute.findOne({
            where: { id: req?.params.id, active: true },
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.getAttributeByType = async (req, res) => {
    try {
        let data = await db.attribute.findAll({
            attributes: ['id', 'name'],
            where: {
                attr_type_id: req.params.attr_type_id,
                active: true
            },
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



exports.CreateAttributeValue = async (req, res) => {
    try {
        await db.attributevalue.create({
            active: true,
            attr_id: req.body.attr_id,
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

exports.GetAttributeValueByAttrId = async (req, res) => {
    try {
        let data = await db.attributevalue.findAll({
            where: {
                active: true,
                attr_id: req.params.attr_id
            }
        });

        return res.status(200).send({
            success: true,
            items: data
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









exports.GetAttributeType = async (req, res) => {

    try {
        const data = await Attribute.findAll({
            where: {
                active: true,
                name: req.body.name,
            }
        })


        return res.status(200).send({
            success: true,
            items: data
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