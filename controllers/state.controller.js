const db = require("../models");
const State = db.state;
const User = db.user;
const Op = db.Sequelize.Op;



exports.getState = async (req, res) => {
    try {
        let data = await State.findAll({
            attributes: ['id', 'name'],
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

exports.getStateWithUser = async (req, res) => {
    try {
        let data = await State.findAll({
            attributes: ['id', 'name']
        })



        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.getStateWithUser = async (req, res) => {
    res.status(200).send({
        success: true,
        items: "Nothing"
    });
    // try {
    //     let data = await State.findAll({
    //         attributes: ['id', 'name', 'userId'],
    //         include: [
    //             {
    //                 model: User,
    //                 attributes: ['id', 'first_name', 'last_name'],
    //             }
    //         ]
    //     });

    //     // Group states by userId
    //     let groupedData = data.reduce((acc, state) => {
    //         let stateName = state.name;
    //         let user = state.user;

    //         if (!acc[stateName]) {
    //             acc[stateName] = {
    //                 name: stateName,
    //                 users: []
    //             };
    //         }

    //         acc[stateName].users.push({
    //             id: user.id,
    //             name: `${user.first_name} ${user.last_name}`,
    //         });

    //         return acc;
    //     }, {});

    //     let result = Object.values(groupedData);

    //     res.status(200).send({
    //         success: true,
    //         items: result
    //     });

    // } catch (error) {
    //     res.status(500).send({ success: false, message: error.message });
    // }
};



exports.CreateState = async (req, res) => {
    try {

        const data = await State.findOne({
            where: {
                name: req.body.name
            }
        });

        if (data) {
            res.status(400).send({
                success: false,
                message: "State Already Exist"
            })
        }

        await State.create({
            name: req.body.name
        });

        res.status(200).send({
            success: true,
            message: "Create state Successfully"
        })


    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

exports.DeleteState = async (req, res) => {

    try {
        await State.destroy({
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