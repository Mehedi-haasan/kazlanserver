const db = require("../models");
const State = db.state;


exports.getState = async (req, res) => {

    try {
        let data = await State.findAll({
            where: { active: true },
            attributes: ['id', 'name'],
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }

}

exports.getStateWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await State.findAll({
            limit: pageSize,
            attributes: ['id','active', 'name'],
            offset: offset
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }

}

exports.getStateWithUser = async (req, res) => {
    try {
        let data = await State.findAll({
            attributes: ['id', 'name']
        })



        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }

}

exports.CreateState = async (req, res) => {
    try {

        const data = await State.findOne({
            where: {
                name: req.body.name
            }
        });

        if (data) {
            return res.status(400).send({
                success: false,
                message: "State Already Exist"
            })
        }

        await State.create({
            name: req.body.name
        });

        return res.status(200).send({
            success: true,
            message: "Create state Successfully"
        })


    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }

}

exports.DeleteState = async (req, res) => {

    try {
        await State.destroy({
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

exports.UpdateState = async (req, res) => {
    try {
        await State.update(
            { name: req.body.name },
            { where: { id: req?.params?.id } }
        );

        return res.status(200).send({
            success: true,
            message: "State updated successfully"
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
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

            await db.state.update(
                { active: item.active }, 
                { where: { id: item.id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "State updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};