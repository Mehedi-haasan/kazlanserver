const db = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.roles;
const UserDue = db.userdue;

const Op = db.Sequelize.Op;


async function someAsyncOperation(rules) {
    let roleId;

    if (rules) {
        if (rules[0] === "admin") {
            roleId = 2;
        } else if (rules[0] === "superadmin") {
            roleId = 3;
        } else if (rules[0] === "modarator") {
            roleId = 4;
        } else {
            roleId = 1;
        }
    }
    return roleId
}

const RoleSetup = async (rules, userId) => {
    if (!rules) return;
    for (const item of rules) {
        await Role.create({
            name: item,
            userId: userId
        });
    }
};


exports.singUp = async (req, res) => {
    const body = req.body;
    try {
        const data = await User.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.username },
                    { email: req.body.email },
                ],
            },
        })

        if (data) {
            return res.status(204).send({
                success: true,
                message: "User Already exist",
            })
        }

        await User.create({
            username: req.body.username,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            image_url: req.body.image_url,
            stateId: req.body.stateId
        });


        const user = await User.findOne({
            order: [['id', 'DESC']]
        });

        await RoleSetup(data?.rules, user?.id);


        res.status(200).send({
            success: true,
            message: "Registration Successfull",
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.singIn = async (req, res) => {
    try {
        const data = await User.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.username },
                    { email: req.body.username },
                ],
            },
        })

        if (!data) {
            return res.status(404).send({ success: false, message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            data.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }


        const token = jwt.sign({ id: data.id }, config.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
        });

        res.status(200).send({
            success: true,
            message: "Login Successfully",
            id: req.userId,
            accessToken: token,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.getUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                stateId: req.params.stateId
            },
            attributes: ['id', 'first_name', 'last_name',]
        });

        let userData = [];


        data?.map((da) => {
            userData.push({
                id: da?.id,
                name: da?.first_name + " " + da?.last_name
            })
        })

        res.status(200).send({
            success: true,
            items: userData,
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




