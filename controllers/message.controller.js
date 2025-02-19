const db = require("../models");
const Message = db.message;




exports.getMessage = async (req, res) => {
    try {
        let data = await Message.findAll({
            attributes: ['id', 'senderId', 'recieverId', 'message'],
            where:{
                senderId: req.userId,
                recieverId:req.params.id
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





// exports.CreateCarousel = async (req, res) => {
//     console.log(req.body.name, req.body.image_url, "carousbfy cj ruwgafcjhwesg dwaefgy");
//     try {
//         await Carousel.create({
//             name: req.body.name,
//             image_url: req.body.image_url
//         });

//         res.status(200).send({
//             success: true,
//             message: "Create Category Successfully"
//         })

//     } catch (error) {
//         res.status(500).send({ success: false, message: error.message });
//     }

// }


exports.DeleteCarousel = async (req, res) => {

    try {
        await Message.destroy({
            where: {
                id: req.params.id
            }
        });

        res.status(200).send({
            success: true,
            message: "State Delete Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}