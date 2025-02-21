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
                isSeen: 'false'
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'image_url']
                }
            ]
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
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

        res.status(200).send({
            success: true,
            message: `Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

