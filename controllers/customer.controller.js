const db = require("../models");


exports.GetWholesellCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                compId: req.compId,
                usertype: "Wholesaler",
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

exports.WholesellCustomer = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await db.customer.findAll({
            limit: pageSize,
            where: {
                compId: req.compId,
                usertype: "Wholesaler",
            },
            offset: offset
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.GetRetailerCustomer = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await db.customer.findAll({
            limit: pageSize,
            where: {
                compId: req.compId,
                usertype: "Retailer",
            },
            offset: offset
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.RetailerCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                compId: req.compId,
                usertype: "Retailer",
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

exports.GetSupplier = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await db.customer.findAll({
            limit: pageSize,
            where: {
                compId: req.compId,
                usertype: "Supplier"
            },
            offset: offset
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.CreateCustomer = async (req, res) => {
    const { name, phone, bankname, accountname, accountnumber, balance, address, email, stateId, usertype, image_url } = req.body;
    try {
        let data = await db.customer.create({
            name: name,
            phone: phone,
            bankname: bankname,
            accountname: accountname,
            accountnumber: accountnumber,
            balance: balance,
            address: address,
            email: email, 
            stateId: stateId,
            compId:req.compId,
            usertype: usertype,
            cretedby:req.userId,
            creator: req.user,
            image_url: image_url
        })
        res.status(200).send({
            success: true,
            message: "Create Successfully",
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.UpdateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, phone, bankname, accountname, accountnumber, balance, address, email, stateId, usertype, image_url } = req.body;

    try {
        let customer = await db.customer.findOne({
            where: {
                id: id
            }
        });

        if (!customer) {
            return res.status(404).send({
                success: false,
                message: "Customer not found",
            });
        }

        await db.customer.update(
            {
                name,
                phone,
                bankname,
                accountname,
                accountnumber,
                balance,
                address,
                email,
                stateId,
                usertype,
                image_url
            },
            {
                where: {
                    id: id  // ✅ Fixed here
                }
            }
        );

        res.status(200).send({
            success: true,
            message: "Updated Successfully",
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};


exports.UpdateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, phone, bankname, accountname, accountnumber, balance, address, email, stateId, usertype, image_url } = req.body;

    try {
        let supplier = await db.customer.findOne({
            where: {
                id: id
            }
        });

        if (!supplier) {
            return res.status(404).send({
                success: false,
                message: "Customer not found",
            });
        }

        await db.customer.update({
            name,
            phone,
            bankname,
            accountname,
            accountnumber,
            balance,
            address,
            email,
            stateId,
            usertype,
            image_url
        }, {
            where: {
                id: id
            }
        }
        );

        res.status(200).send({
            success: true,
            message: "Updated Successfully",
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};

exports.GetCustomerDue = async (req, res) => {
    try {
        let data = await db.customer.findOne({ where: { id: req.params.userId, } })
        res.status(200).send({
            success: true,
            balance: data?.balance
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}