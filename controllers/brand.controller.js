const db = require("../models");
const Brand = db.brand;
const deletePhoto = require('../controllers/filedelete.controller')

exports.getBrandAll = async (req, res) => {
    try {
        let data = await Brand.findAll({
            attributes: ['id', 'name', 'image_url'],
            where: { compId: req?.compId },
            order: [['createdAt', 'DESC']],
        })
        res.status(200).send({
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
            attributes: ['id', 'name', 'image_url'],
            where: { compId: req?.compId },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}




exports.CreateBrand = async (req, res) => {
    console.log(req.user,"user")
    try {
        await Brand.create({
            name: req.body.name,
            image_url: req.body.image_url,
            compId: req.compId,
            createdby: req.userId,
            creator: req.user
        });

        res.status(200).send({
            success: true,
            message: "Create Brand Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.updateBrand = async (req, res) => {
    try {
        const { id, name, image_url, url } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Order ID and status are required."
            });
        }


        const [updatedRowsCount] = await Brand.update(
            { name: name, image_url: image_url },
            { where: { id: id } }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).send({
                success: false,
                message: "Order not found or status is already the same."
            });
        }
        deletePhoto(url)
        res.status(200).send({
            success: true,
            message: `Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.DeleteBrand = async (req, res) => {
    try {
        const { id, url } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Brand ID is required."
            });
        }

        const deletedRowsCount = await Brand.destroy({ where: { id } });

        if (deletedRowsCount === 0) {
            return res.status(404).send({
                success: false,
                message: "Brand not found."
            });
        }
        deletePhoto(url)
        res.status(200).send({
            success: true,
            message: "Brand deleted successfully.",
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

