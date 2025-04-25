const db = require("../models");


exports.GetCustomerWithState = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 20,
            where: {
                compId: req.compId,
                stateId: req.params.stateId,
                usertype: "Customer"
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

exports.GetCustomerWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await db.customer.findAll({
            limit: pageSize,
            where: {
                compId: req.compId,
                usertype: "Customer"
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

exports.GetSupplierWithPage = async (req, res) => {
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
    const { name, phone, bankname, accountname, accountnumber, balance,
        balance_type, address, email, stateId, usertype, image_url } = req.body;
    try {
        let data = await db.customer.create({
            name: name,
            phone: phone,
            bankname: bankname,
            accountname: accountname,
            accountnumber: accountnumber,
            balance: balance,
            balance_type: balance_type,
            address: address,
            email: email,
            stateId: stateId,
            compId: req.compId,
            usertype: usertype,
            cretedby: req.userId,
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
            balance: data?.balance,
            phone: data?.phone
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.PaymentHistory = async (req, res) => {

    try {
        let data = await db.customer.findOne({ where: { id: req.params.id } });
        let history = await db.invoice.findAll({
            where: {
                userId: req.params.id
            }
        })
        res.status(200).send({
            success: true,
            items: data,
            history: history
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}