const db = require("../models");
const { Op } = require("sequelize");


exports.GetWholesellCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                cretedby: req.userId,
                usertype: "Wholesaler",
                stateId: req.params.stateId
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
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                cretedby: req.userId,
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

exports.GetRetailerCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                createdby: req.userId,
                usertype: "Retailer",
                stateId: req.params.stateId
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

exports.RetailerCustomer = async (req, res) => {
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                createdby: req.userId,
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
    try {
        let data = await db.customer.findAll({
            limit: 15,
            where: {
                cretedby: req.userId,
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
            email: email, stateId: stateId,
            usertype: usertype,
            cretedby: req.userId,
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