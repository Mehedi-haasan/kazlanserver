const { resolve } = require("path");
const db = require("../models");
const User = db.user;
const Product = db.product;
const UserDue = db.userdue;


exports.getUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                cretedby: req.userId
            },
            attributes: ['id', 'first_name', 'last_name',]
        });

        let user = [];
        data?.map((item) => {
            user.push({
                id: item?.id,
                name: `${item?.first_name} ${item?.last_name}`,
                username: item?.username,
                whatsapp: item?.whatsapp,
                address: item?.address,
                email: item?.email,
                image_url: item?.image_url,
                cretedby: item?.cretedby
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

        let user = [];
        data?.map((item) => {
            user.push({
                id: item?.id,
                name: `${item?.first_name} ${item?.last_name}`,
                username: item?.username,
                whatsapp: item?.whatsapp,
                address: item?.address,
                email: item?.email,
                image_url: item?.image_url,
                cretedby: item?.cretedby
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


exports.getSupplier = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                usertype: "supplier",
                cretedby: req.userId
            }
        });

        let user = [];
        data?.map((item) => {
            user.push({
                id: item?.id,
                name: `${item?.first_name} ${item?.last_name}`,
                username: item?.username,
                whatsapp: item?.whatsapp,
                address: item?.address,
                email: item?.email,
                image_url: item?.image_url,
                cretedby: item?.cretedby
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


exports.getShop = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                usertype: "shop",
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
    try {
        // Fetch all shops
        const shops = await User.findAll({
            where: {
                usertype: "shop",
            },
            attributes: ["id", "first_name", "last_name"],
            limit: 3
        });
        let shopData = [];
        if (shops.length > 0) {
            shopData = await Promise.all(
                shops.map(async (shop) => {
                    const products = await Product.findAll({
                        where: {
                            createdby: shop.id,
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



