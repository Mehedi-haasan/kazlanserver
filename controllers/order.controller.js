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
            methodname: methodname,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: previousdue,
            paidamount: paidamount,
            due: total - paidamount,
            status: pay_type,
            type: "Sale",
            deliverydate: deliverydate,
            balance: parseInt(user?.balance) + parseInt(amount)
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


        if (user) { await Customer.update({ balance: user.balance + amount }, { where: { id: userId } }); }

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
            return: total,
            due: 0,
            status: pay_type,
            type: "Sale Return",
            deliverydate: deliverydate,
            balance: parseInt(user?.balance) - parseInt(total)
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


exports.UpdateOrder = async (req, res) => {

    const { invoice, allData } = req.body;

    try {

        const PrevInvoice = await Invoice.findOne({ where: { id: invoice?.id } })
        const Invo = await Invoice.update(invoice, { where: { id: invoice?.id } });
        const updatedOrders = allData.map(order => ({
            ...order,
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));

        let ReturnDatas = await SaleOrder.findAll({ where: { invoice_id: invoice?.id } })
        await Promise.all(ReturnDatas?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product.qty) + parseInt(pro.qty) },
                    { where: { id: product.id } }
                );
            }
        }));

        let DeleteData = await SaleOrder.update(
            { active: false },
            { where: { invoice_id: invoice?.id } }
        );

        await SaleOrder.bulkCreate(updatedOrders);

        await Promise.all(updatedOrders?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product?.qty) - parseInt(pro?.qty) },
                    { where: { id: product.id } }
                );
            }
        }));

        const user = await Customer.findOne({ where: { id: invoice?.userId } });

        if (user) {
            const adjustedBalance = user.balance - PrevInvoice?.paidamount + invoice?.total;

            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: invoice?.userId } }
            );
        }




        return res.status(200).send({
            success: true,
            message: "Update Order Successfull",
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
            return: total,
            due: 0,
            status: pay_type,
            type: "Return Purchase",
            deliverydate: deliverydate,
            balance: parseInt(user?.balance) + parseInt(amount)
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
            deliverydate: deliverydate,
            balance: parseInt(user?.balance) - parseInt(amount)
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



exports.OfflineToOnline = async (req, res) => {

    const { allData } = req.body;

    const transaction = await sequelize.transaction();

    try {

        await Promise.all(allData.map(async (item) => {
            const invoice = await Invoice.create({
                date: item?.date,
                compId: req?.compId,
                shopname: item?.shopname,
                createdby: req.userId,
                creator: req?.user,
                userId: item?.userId,
                total: item?.total,
                methodname: "Offline",
                paymentmethod: item?.paymentmethod,
                packing: item?.packing,
                delivery: item?.delivery,
                lastdiscount: item?.lastdiscount,
                customername: item?.customername,
                previousdue: item?.previousdue,
                paidamount: item?.total,
                due: item?.due,
                status: item?.status,
                type: item?.type,
                deliverydate: item?.deliverydate
            });

            if (!invoice || !invoice.id) {
                await transaction.rollback();
                return res.status(400).send({ success: false, message: "Failed to create invoice" });
            }

            const user = await Customer.findOne({ where: { id: item?.userId }, transaction });

            const updatedOrders = item?.saleItems.map(order => ({
                ...order,
                invoice_id: invoice.id,
                compId: req?.compId,
                createdby: req?.userId,
                creator: req?.user
            }));

            await SaleOrder.bulkCreate(updatedOrders, { transaction });

            for (const pro of updatedOrders) {
                const product = await Product.findOne({ where: { code: pro?.code } });
                if (product) {
                    await Product.update({
                        qty: parseInt(product?.qty) - parseInt(pro?.qty)
                    },
                        { where: { code: product?.code, }, transaction });
                }
            }

            if (user) { await Customer.update({ balance: user.balance + item?.due }, { where: { id: item?.userId }, transaction }); }

            await Notification.create({
                isSeen: 'false',
                status: 'success',
                userId: item?.userId,
                shop: item?.shop,
                compId: req?.compId,
                invoiceId: invoice?.id,
                createdby: req?.userId,
                creator: req?.user
            }, { transaction });

        }))

        await transaction.commit();

        return res.status(200).send({
            success: true,
            message: "Upload Successfull"
        })

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.GetOfflineData = async (req, res) => {
    try {
        const data = await Invoice.findAll({
            where: {
                compId: req?.compId,
                active: true
            }
        });

        const allData = await Promise.all(data.map(async (it) => {
            const saleItems = await SaleOrder.findAll({
                where: {
                    invoice_id: it?.id
                },
                attributes: ['active', 'invoice_id', 'product_id', 'username', 'code', 'userId', 'name', 'shop', 'price',
                    'discount', 'discount_type', 'sellprice', 'qty', 'contact', 'date', 'type', 'deliverydate', 'categoryId']
            });
            return {
                ...it.toJSON(),
                saleItems: saleItems
            };
        }));

        return res.status(200).send({
            success: true,
            items: allData,
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};


exports.DeleteLocalData = async (req, res) => {
    try {
        // Soft-delete all invoice records
        await Invoice.update(
            { active: false },
            { where: { compId: req?.compId, active: true } }
        );

        // Soft-delete all sale order records
        await SaleOrder.update(
            { active: false },
            { where: { compId: req?.compId, active: true } }
        );

        return res.status(200).send({
            success: true,
            message: "All invoice and sale data have been marked as inactive.",
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};


