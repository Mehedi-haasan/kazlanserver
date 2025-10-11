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
                active: true,
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
                active: true,
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

exports.SearchCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            where: {
                active: true,
                compId: req.compId,
                name: { [Op.like]: `%${req.body.name}%` },
                usertype: req.body.type
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

exports.SearchDueCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            where: {
                active: true,
                compId: req.compId,
                balance: { [Op.lt]: req.params.due },
                usertype: req.params.type
            },
            include: [{ model: db.state }]
        })
        return res.status(200).send({
            success: true,
            items: data,
            count: data?.length
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


        let whereCondition = {
            active: true,
            compId: req.compId,
            usertype: "Customer",
        };
        if (req.params.customertype === "Normal" || req.params.customertype === "Party") {
            whereCondition['customertype'] = req.params.customertype;
        }

        let data = await db.customer.findAll({
            limit: pageSize,
            where: whereCondition,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.state }
            ]
        })

        let total = await db.customer.count({
            where: {
                active: true,
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

exports.GetSupplierWithPage = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await db.customer.findAll({
            limit: pageSize,
            where: {
                active: true,
                compId: req.compId,
                usertype: "Supplier"
            },
            order: [['createdAt', 'DESC']],
            offset: offset,
            include: [
                { model: db.state }
            ]

        })

        let total = await db.customer.count({
            where: {
                active: true,
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
    const { name, phone, bankname, accountname, accountnumber, balance, customertype, shopname,
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
        if (balance_type === "You Receive") {
            userBalance = balance * -1
        } else if (balance_type === "You Pay") {
            userBalance = balance
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

        const Invoice = await db.invoice.create({
            date: getFormattedDate(),
            compId: req?.compId,
            shopname: shopname,
            createdby: req.userId,
            creator: req?.user,
            userId: data?.id,
            total: userBalance,
            paymentmethod: "",
            methodname: `Online`,
            packing: 0,
            delivery: 0,
            lastdiscount: 0,
            customername: data?.name,
            previousdue: 0,
            paidamount: 0,
            due: 0,
            status: "Paid",
            type: "Opening",
            deliverydate: getFormattedDate(),
            balance: userBalance,
            special_discount: 0,
            sup_invo: ''
        });
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
        let curent = 0
        let final_return = 0;
        let paid_amount = parseInt(req.body.paid)
        if (req?.params?.type === "1") {
            curent = customer?.balance - parseInt(req.body.paid)
            final_return = req.body.paid;
            paid_amount = 0;
            console.log("hitting");
        } else if (req?.params?.type === "2") {
            curent = customer?.balance + parseInt(req.body.paid)
        }

        await db.invoice.create({
            date: req.body.date,
            payment_type: req?.body?.payment_type,
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
            previousdue: curent,
            paidamount: paid_amount,
            due: 0,
            return: final_return,
            status: req.body.status,
            type: req.body.type,
            deliverydate: getFormattedDate(),
            balance: curent,
            special_discount: 0,
            sup_invo: ''
        });

        if (req?.params?.type === "1") {
            await db.customer.update({ balance: curent }, { where: { id: req?.params?.id } });
        } else if (req?.params?.type === "2") {
            await db.customer.update({ balance: curent }, { where: { id: req?.params?.id } });
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

exports.EditUserBalance = async (req, res) => {
    const { invo } = req?.body
    try {
        let Invo = await db.invoice.findOne({
            where: {
                id: invo?.id
            }
        })

        let prev_customer = await db.customer.findOne({
            where: {
                id: Invo?.userId
            }
        });


        if (Invo?.payment_type === "You Pay") {
            await db.customer.update({ balance: prev_customer?.balance + Invo?.paidamount }, { where: { id: prev_customer?.id } });
        } else if (Invo?.payment_type === "You Receive") {
            await db.customer.update({ balance: prev_customer?.balance - Invo?.paidamount }, { where: { id: prev_customer?.id } });
        }

        let next_customer = await db.customer.findOne({
            where: {
                id: invo?.userId
            }
        });

        let curent = 0
        if (req?.params?.type === "1") {
            curent = next_customer?.balance - parseInt(invo?.paidamount)
        } else if (req?.params?.type === "2") {
            curent = next_customer?.balance + parseInt(invo?.paidamount)
        }

        await db.invoice.update(invo, { where: { id: Invo?.id } });

        if (req?.params?.type === "1") {
            await db.customer.update({ balance: curent }, { where: { id: next_customer?.id } });
        } else if (req?.params?.type === "2") {
            await db.customer.update({ balance: curent }, { where: { id: next_customer?.id } });
        }


        return res.status(200).send({
            success: true,
            message: "Updated Successfully",
            invo: Invo,
            prev_cus: prev_customer,
            next_cus: next_customer
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
            history: history,
            count: history?.length
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};


exports.DeleteCustomer = async (req, res) => {
    try {
        // Find customer first
        const customer = await db.customer.findOne({ where: { id: req.params.id } });

        if (!customer) {
            return res.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        // Soft delete (set active to false)
        await db.customer.update(
            { active: false },
            { where: { id: req.params.id } }
        );

        return res.status(200).send({
            success: true,
            message: `${customer?.usertype} deleted successfully`
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};



exports.BulkUpdate = async (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update."
            });
        }


        for (const item of data) {
            if (!item.id) continue;

            await db.customer.update(
                { active: item.active }, // ✅ Only update `active` field
                { where: { id: item.id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Attributes updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.BulkGetCustomer = async (req, res) => {
    try {
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let allBrand = await db.customer.findAll({
            limit: pageSize,
            offset: offset,
        })

        return res.status(200).json({
            success: true,
            items: allBrand
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.BulkCreate = async (req, res) => {
    try {
        let { data } = req.body

        await db.customer.bulkCreate(data);

        return res.status(200).json({
            success: true,
            message: "Updated Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};