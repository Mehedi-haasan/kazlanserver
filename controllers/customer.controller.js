const db = require("../models");
const { Op } = require("sequelize");

function getFormattedDate() {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-EN', options);
}

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
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
            offset: offset,
            include: [
                { model: db.state }
            ]
        })

        let total = await db.customer.count({
            where: {
                compId: req.compId,
                usertype: "Customer"
            }
        })

        return res.status(200).send({
            success: true,
            items: data,
            count: total
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
            offset: offset,
            include: [
                { model: db.state }
            ]

        })

        let total = await db.customer.count({
            where: {
                compId: req.compId,
                usertype: "Supplier"
            }
        })
        return res.status(200).send({
            success: true,
            items: data,
            count: total
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.CreateCustomer = async (req, res) => {
    const { name, phone, bankname, accountname, accountnumber, balance, customertype,
        balance_type, address, email, stateId, usertype, image_url } = req.body;
    try {
        const existcustomer = await db.customer.findOne({
            where: {
                name: req.body.name,
                compId: req.body.compId ? req.body.compId : req.compId,
                usertype: usertype,
            }
        })

        if (existcustomer) {
            return res.status(400).send({
                success: false,
                message: `${usertype === "Supplier" ? "Supplier already exists" : "Customer already exists"}`
            });
        }

        let userBalance = 0
        if (balance_type === "To Receive") {
            userBalance = balance
        } else if (balance_type === "To Pay") {
            userBalance = balance * -1
        } else {
            userBalance = balance
        }

        let data = await db.customer.create({
            name: name,
            phone: phone,
            bankname: bankname,
            accountname: accountname,
            accountnumber: accountnumber,
            balance: userBalance,
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
        return res.status(200).send({
            success: true,
            message: "Create Successfully",
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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

        return res.status(200).send({
            success: true,
            message: "Updated Successfully",
        });

    } catch (error) {
        return res.status(500).send({
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
        if (!customer) {
            return res.status(200).send({
                success: true,
                message: "Customer not found",
            });
        }
        const invoice = await db.invoice.create({
            date: getFormattedDate(),
            compId: req?.compId,
            shopname: req?.body?.shop,
            createdby: req.userId,
            creator: req?.user,
            userId: req?.params?.id,
            paymentmethod: req.body?.paymentmethod,
            total: 0,
            packing: 0,
            delivery: 0,
            lastdiscount: 0,
            methodname: req.body.methodname,
            customername: customer?.name,
            previousdue: customer?.balance,
            paidamount: parseInt(req.body.paid),
            due: 0,
            status: "Paid",
            type: "Purchase items",
            deliverydate: getFormattedDate()
        });

        if (req?.params?.type === "1") {
            await db.customer.update({ balance: parseInt(customer?.balance) + parseInt(req.body.paid) }, { where: { id: req?.params?.id } });
        } else if (req?.params?.type === "2") {
            await db.customer.update({ balance: parseInt(customer?.balance) - parseInt(req.body.paid) }, { where: { id: req?.params?.id } });
        }


        return res.status(200).send({
            success: true,
            message: "Updated Successfully",
            customertype: customer?.customertype
        });

    } catch (error) {
        return res.status(500).send({
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

        return res.status(200).send({
            success: true,
            message: "Updated Successfully",
        });

    } catch (error) {
        return res.status(500).send({
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

        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.GetCustomerDue = async (req, res) => {
    try {
        let data = await db.customer.findOne({ where: { id: req.params.userId, } })
        return res.status(200).send({
            success: true,
            balance: data?.balance,
            phone: data?.phone
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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

        return res.status(200).send({
            success: true,
            items: data,
            history: history
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};
