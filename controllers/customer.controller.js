const db = require("../models");
const { Op } = require("sequelize");

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

exports.GetSupplierWithState = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 20,
            where: {
                compId: req.compId,
                stateId: req.params.stateId,
                usertype: "Supplier"
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

        let total = await db.customer.count({
            where: {
                compId: req.compId,
                usertype: "Customer"
            }
        })

        res.status(200).send({
            success: true,
            items: data,
            count: total
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

        let total = await db.customer.count({
            where: {
                compId: req.compId,
                usertype: "Supplier"
            }
        })
        res.status(200).send({
            success: true,
            items: data,
            count: total
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.CreateCustomer = async (req, res) => {
    const { name, phone, bankname, accountname, accountnumber, balance, customertype,
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
            image_url: image_url,
            customertype: customertype
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

exports.UpdateCustomerBalance = async (req, res) => {

    try {
        let customer = await db.customer.findOne({
            where: {
                id: req?.params?.id
            }
        });

        await db.customer.update({ balance: parseInt(customer?.balance) + parseInt(req.body.paid) }, { where: { id: req?.params?.id } });

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

exports.GetSingleCustomer = async (req, res) => {
    try {
        let data = await db.customer.findOne({
            where: {
                id: req.params.id,
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
        const { fromDate, toDate } = req.body;

        const from = new Date(fromDate);
        const to = new Date(toDate);

        // Ensure full day is included for the end date
        to.setHours(23, 59, 59, 999);

        const data = await db.customer.findOne({ where: { id: req.params.id } });

        const history = await db.invoice.findAll({
            where: {
                userId: req.params.id,
                createdAt: {
                    [Op.between]: [from, to]
                }
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            success: true,
            items: data,
            history: history
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};
