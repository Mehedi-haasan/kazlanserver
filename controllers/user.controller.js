var bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;
const Product = db.product;
const { Op } = require("sequelize");


exports.getUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                cretedby: req.userId
            },
            attributes: ['id', 'name']
        });


        res.status(200).send({
            success: true,
            items: data,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.getUsersWithRole = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const data = await User.findAll({
            where: { cretedby: req.userId },
            limit: pageSize,
            offset: offset
        });

        let users = []
        users = await Promise.all(
            data?.map(async (us) => {
                const user = await db.role.findAll({
                    where: {
                        userId: us.id,
                    }
                });

                return {
                    ...us.toJSON(),
                    role: user
                };
            })
        )

        res.status(200).send({
            success: true,
            items: users,
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
            attributes: ['id', 'name', 'username']
        });

        res.status(200).send({
            success: true,
            items: data,
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


exports.getShop = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                usertype: { [Op.or]: ["Wholesale", "Retailer"] },
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

exports.getShopList = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        // Fetch all shops
        const shops = await db.company.findAll({
            attributes: ["id", "name"],
            limit: pageSize,
            offset: offset
        });



        let shopData = [];
        if (shops.length > 0) {
            shopData = await Promise.all(
                shops.map(async (shop) => {
                    const products = await Product.findAll({
                        where: {
                            compId: shop.id,
                        },
                        attributes: ["id", "name", "cost", "price", "qty"]
                    });

                    let TotalCost = products?.reduce((acc, item) => {
                        return acc + parseInt(item?.cost) * parseInt(item?.qty)
                    }, 0);

                    let TotalWorth = products?.reduce((acc, item) => {
                        return acc + parseInt(item?.price) * parseInt(item?.qty)
                    }, 0);
                    let count = products?.length

                    return {
                        ...shop.toJSON(),
                        TotalCost,
                        TotalWorth,
                        count
                    };
                })
            );
        }

        res.status(200).send({
            success: true,
            items: shopData,
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
            },
            include: [
                {
                    model: db.state
                }
            ]
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
    const { name,
        username,
        bankname,
        bankaccount,
        accountnumber,
        address,
        email,
        stateId,
        usertype,
        cretedby,
        password,
        image_url } = req.body;

    try {

        await User.update(
            {
                name,
                username,
                bankname,
                bankaccount,
                accountnumber,
                address,
                email,
                stateId,
                usertype,
                cretedby,
                password,
                image_url

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

exports.ChangePassword = async (req, res) => {
    const id = req.userId;
    const { name, username, bankname, bankaccount, accountnumber, address, email, stateId, usertype, cretedby, password, image_url } = req.body;

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


        await User.update(
            {
                name,
                username,
                bankname,
                bankaccount,
                accountnumber,
                address,
                email,
                stateId,
                usertype,
                cretedby,
                password: bcrypt.hashSync(password, 8),
                image_url

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



