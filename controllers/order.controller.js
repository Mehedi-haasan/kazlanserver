const db = require("../models");
const SaleOrder = db.saleorder;
const Customer = db.customer;
const Product = db.product;
const Notification = db.notification;
const Invoice = db.invoice;
const sequelize = db.sequelize;




exports.CreateOrder = async (req, res) => {

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, methodname,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, paymentmethod } = req.body;

    let transaction;

    try {
        transaction = await sequelize.transaction();
        const invoice = await Invoice.create({
            date: date,
            compId: req?.compId,
            shopname: shop,
            createdby: req.userId,
            creator: req?.user,
            userId: userId,
            total: total,
            paymentmethod: paymentmethod,
            methodname: methodname,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: previousdue,
            paidamount: paidamount,
            due: total - paidamount,
            status: total > paidamount ? "Due" : "Paid",
            type: "Sale",
            deliverydate: deliverydate
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        const updatedOrders = orders.map(order => ({
            ...order,
            type: "Sale",
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));

        await SaleOrder.bulkCreate(updatedOrders);

        for (const pro of updatedOrders) {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update({ qty: parseInt(product?.qty) - parseInt(pro?.qty) }, { where: { id: product?.id, }, });
            }
        }

        const user = await Customer.findOne({ where: { id: userId } });
        if (user) { await Customer.update({ balance: user.balance + amount }, { where: { id: userId } }); }



        await Notification.create({
            isSeen: 'false',
            status: 'success',
            userId: userId,
            shop: shop,
            compId: req?.compId,
            invoiceId: invoice.id,
            createdby: req?.userId,
            creator: req?.user
        });

        await transaction.commit();
        return res.status(200).send({
            success: true,
            message: "Order Create Successfull",
            invoice: invoice?.id

        })

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.ReturnOrder = async (req, res) => {

    const { shop, customername, orders, userId, lastdiscount, date, packing,
        delivery, total, deliverydate, pay_type, paymentmethod, methodname } = req.body;

    let transaction;

    try {
        transaction = await sequelize.transaction();

        const user = await Customer.findOne({ where: { id: userId } });

        const invoice = await Invoice.create({
            date: date,
            compId: req?.compId,
            shopname: shop,
            createdby: req.userId,
            creator: req?.user,
            userId: userId,
            paymentmethod: paymentmethod,
            methodname: methodname,
            total: total,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: user?.balance,
            paidamount: total,
            due: 0,
            status: pay_type,
            type: "Sale Return",
            deliverydate: deliverydate
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        const updatedOrders = orders.map(order => ({
            ...order,
            type: "Sale Return",
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));

        await SaleOrder.bulkCreate(updatedOrders);

        for (const pro of updatedOrders) {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update({ qty: parseInt(product?.qty) + parseInt(pro?.qty) }, { where: { id: product?.id, }, });
            }
        }


        if (user) { await Customer.update({ balance: user.balance - total }, { where: { id: userId } }); }



        await Notification.create({
            isSeen: 'false',
            status: 'success',
            userId: userId,
            shop: shop,
            compId: req?.compId,
            invoiceId: invoice.id,
            createdby: req?.userId,
            creator: req?.user
        });

        await transaction.commit();
        return res.status(200).send({
            success: true,
            message: "Order Return Successfull",
            invoice: invoice?.id

        })

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.ReturnPurchase = async (req, res) => {

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, methodname,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, paymentmethod } = req.body;

    let transaction;

    try {
        // transaction = await sequelize.transaction();
        const user = await Customer.findOne({ where: { id: userId } });

        const invoice = await Invoice.create({
            date: date,
            compId: req?.compId,
            shopname: shop,
            createdby: req.userId,
            creator: req?.user,
            userId: userId,
            total: total,
            methodname: methodname,
            paymentmethod: paymentmethod,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: previousdue,
            paidamount: total,
            due: 0,
            status: pay_type,
            type: "Return Purchase",
            deliverydate: deliverydate
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        const updatedOrders = orders.map(order => ({
            ...order,
            type: "Return Purchase",
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));

        await SaleOrder.bulkCreate(updatedOrders);



        for (const pro of updatedOrders) {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update({
                    qty: parseInt(product?.qty) - parseInt(pro?.qty)
                },
                    { where: { id: product?.id, }, });
            }
        }


        if (user) { await Customer.update({ balance: user.balance + amount }, { where: { id: userId } }); }



        await Notification.create({
            isSeen: 'false',
            status: 'success',
            userId: userId,
            shop: shop,
            compId: req?.compId,
            invoiceId: invoice.id,
            createdby: req?.userId,
            creator: req?.user
        });

        // await transaction.commit();
        return res.status(200).send({
            success: true,
            message: "Return Purchased Successfull",
            invoice: invoice?.id

        })

    } catch (error) {
        // if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.PurchaseProduct = async (req, res) => {

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, paymentmethod, methodname,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, updatedata } = req.body;

    let transaction;

    try {
        transaction = await sequelize.transaction();

        const user = await Customer.findOne({ where: { id: userId } });


        const invoice = await Invoice.create({
            date: date,
            compId: req?.compId,
            shopname: shop,
            createdby: req.userId,
            creator: req?.user,
            userId: userId,
            total: total,
            paymentmethod: paymentmethod,
            packing: packing,
            delivery: delivery,
            methodname: methodname,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: user?.balance,
            paidamount: paidamount,
            due: total - paidamount,
            status: pay_type,
            type: "Purchase items",
            deliverydate: deliverydate
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        const updatedOrders = orders.map(order => ({
            ...order,
            type: "Purchase items",
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));
        await SaleOrder.bulkCreate(updatedOrders);

        for (const pro of updatedata) {
            const product = await Product.findOne({
                where: { id: pro?.id }
            });
            if (product) {
                await Product.update({ qty: parseInt(product?.qty) + parseInt(pro?.qty) }, { where: { id: product?.id, }, });
            }
        }

        if (user) {
            await Customer.update({ balance: user.balance - amount }, { where: { id: userId } });
        }



        await Notification.create({
            isSeen: 'false',
            status: 'success',
            userId: userId,
            shop: shop,
            compId: req?.compId,
            invoiceId: invoice.id,
            createdby: req?.userId,
            creator: req?.user
        });

        await transaction.commit();
        return res.status(200).send({
            success: true,
            message: "Purchased items Successfull",
            invoice: invoice?.id

        })

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}