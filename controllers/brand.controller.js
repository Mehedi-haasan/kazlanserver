const db = require("../models");
const Brand = db.brand;



exports.getBrand = async (req, res) => {
    try {
        let data = await Brand.findAll({
            limit: 15,
            attributes: ['id', 'name', 'image_url'],
            where: {
                createdby: req.userId
            }
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
    try {
        await Brand.create({
            name: req.body.name,
            image_url: req.body.image_url,
            createdby: req.userId
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
        const { id, name, image_url } = req.body;

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

        res.status(200).send({
            success: true,
            message: `Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}
