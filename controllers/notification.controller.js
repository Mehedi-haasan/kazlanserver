const db = require("../models");
const Notification = db.notification;
const User = db.user;
const Op = db.Sequelize.Op;



exports.getNotification = async (req, res) => {
    try {
        let data = await Notification.findAll({
            limit: 10,
            order: [['id', 'DESC']],
            where: {
                isSeen: 'false',
                compId: {
                    [Op.or]: [req?.compId, 0]
                }
            }
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.CreateAnnouncement = async (req, res) => {
    try {
        const { mgs, shop } = req.body;
        await Notification.create({
            isSeen: 'false',
            status: mgs,
            userId: 1,
            shop: shop,
            compId: 0,
            invoiceId: 0,
            createdby: req?.userId,
            creator: req?.user
        });
        return res.status(200).send({
            success: true,
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}



exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Order ID and status are required."
            });
        }


        const [updatedRowsCount] = await Notification.update(
            { isSeen: 'true' }, // Updating field
            { where: { id: id } } // Condition to update
        );

        return res.status(200).send({
            success: true,
            message: `Updated successfully`,
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

