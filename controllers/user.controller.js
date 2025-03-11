const db = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const UserDue = db.userdue;

const Op = db.Sequelize.Op;


exports.getUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                cretedby: req.userId
            },
            attributes: ['id', 'first_name', 'last_name',]
        });

        res.status(200).send({
            success: true,
            items: data,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};


exports.getUsersbyState = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                stateId: req.params.stateId
            },
            attributes: ['id', 'first_name', 'last_name', 'username']
        });

        let user = []

        data?.map((it) => {
            user.push({
                id: it?.id,
                name: `${it?.first_name} ${it?.last_name}`,
                username: it?.username
            })
        })
        res.status(200).send({
            success: true,
            items: user,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};



exports.getCustomer = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                usertype: "customer",
                cretedby: req.userId
            }
        });

        res.status(200).send({
            success: true,
            items: data,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};
exports.getSupplier = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                usertype: "supplier",
                cretedby: req.userId
            }
        });

        res.status(200).send({
            success: true,
            items: data,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.getSingleUsers = async (req, res) => {
    try {
        const data = await User.findOne({
            where: {
                id: req.userId
            }
        })
        res.status(200).send({
            success: true,
            items: data,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

exports.updateUsers = async (req, res) => {
    const id = req.userId;
    const { first_name, last_name, email, username, password, image_url, stateId } = req.body;

    try {

        await User.update(
            {
                first_name,
                last_name,
                username,
                email,
                password,
                image_url,
                stateId
            },
            {
                where: { id }
            }
        );
        res.status(200).send({
            success: true,
            message: "Update Successfulll",
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.UserDueCreate = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const user = await UserDue.findOne({ where: { userId } });

        if (user) {
            await UserDue.update(
                { amount: user.amount + amount },
                { where: { userId } }
            );
        } else {
            await UserDue.create({ userId, amount });
        }

        res.status(200).send({
            success: true,
            message: "Success",
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.UserDue = async (req, res) => {
    const id = req.params.id;

    try {
        let user = await UserDue.findOne({
            where: {
                userId: id
            }
        });
        res.status(200).send({
            success: true,
            items: user,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};



