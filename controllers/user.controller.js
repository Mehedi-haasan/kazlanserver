const db = require("../models");
const User = db.user;
const Product = db.product;
const UserDue = db.userdue;
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
    try {
        const data = await User.findAll({
            where: {
                cretedby: req.userId
            }
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
    try {
        // Fetch all shops
        const shops = await User.findAll({
            where: {
                usertype: { [Op.or]: ["Wholesaler", "Retailer"] },
            },
            attributes: ["id", "name"],
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
    const { name, email, username, password, image_url, stateId } = req.body;

    try {

        await User.update(
            {
                name,
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




