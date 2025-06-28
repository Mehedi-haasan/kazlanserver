const db = require("../models");
const Message = db.message;




exports.getMessage = async (req, res) => {
    try {
        let data = await Message.findAll({
            attributes: ['id', 'senderId', 'recieverId', 'message'],
            where: {
                senderId: req.userId,
                recieverId: req.params.id
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





exports.DeleteCarousel = async (req, res) => {

    try {
        await Message.destroy({
            where: {
                id: req.params.id
            }
        });

        return res.status(200).send({
            success: true,
            message: "State Delete Successfully"
        })

    } catch (error) {
       return res.status(500).send({ success: false, message: error.message });
    }

}