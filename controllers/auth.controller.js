const db = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;


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
    const { name, username, bankname, accountname, accountnumber, address, email, stateId, compId, usertype, password, image_url } = req.body;
    try {
        const data = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email },
                ],
            },
        })

        if (data) {
            return res.status(200).send({
                success: true,
                message: "User Already exist",
            })
        }

        await User.create({
            name: name,
            active: true,
            username: username,
            bankname: bankname,
            accountname: accountname,
            accountnumber: accountnumber,
            address: address,
            email: email,
            stateId: stateId,
            compId: compId,
            usertype: usertype,
            cretedby: req.userId,
            password: bcrypt.hashSync(password, 8),
            image_url: image_url || 'https://cdn-icons-png.flaticon.com/128/2202/2202112.png',
        });


        const user = await User.findOne({
            order: [['id', 'DESC']]
        });

        await RoleSetup(req?.body?.rules, user?.id);


        return res.status(200).send({
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
                active: true
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
            expiresIn: 43200
        });

        let role = await Role.findOne({
            where: {
                userId: data?.id
            }
        })

        let comp = await db.company.findOne({
            where: {
                id: data?.compId
            }
        })

        return res.status(200).send({
            success: true,
            message: "Login Successfully",
            name: data?.name,
            compId: data?.compId,
            image: data?.image_url,
            logo: comp?.image_url,
            shopname: comp?.name,
            shopcode: comp?.shopcode,
            role: role?.name,
            id: data?.id,
            usertype: data?.usertype,
            accessToken: token,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

exports.ForgetPassword = async (req, res) => {
    try {
        let user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        return res.status(200).send({
            success: true,
            items: user,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.OtpVarification = async (req, res) => {
    try {
        let user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        return res.status(200).send({
            success: true,
            items: user,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


