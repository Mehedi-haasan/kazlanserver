const db = require("../models");
const SaleOrder = db.saleorder;
const Customer = db.customer;
const Product = db.product;
const Notification = db.notification;
const Invoice = db.invoice;
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");


const ReCalculate = async (userId) => {
    const first_invoice = await Invoice.findOne({
        where: {
            userId: userId,
            active: true,
        },
        order: [["id", "ASC"]],
    });

    const nextInvoices = await Invoice.findAll({
        where: {
            userId: userId,
            active: true,
        },
        order: [["id", "ASC"]],
    });

    let user = await Customer.findOne({
        where: {
            id: userId
        }
    })

    const recalculatedInvoices = [];
    let previousBalance = first_invoice.balance;

    if (user?.usertype === "Customer") {
        for (const invoice of nextInvoices) {
            const newBalance = previousBalance + (invoice.total*-1) + invoice.paidamount - invoice.return;
            const new_invo = invoice.get({ plain: true });
            new_invo.balance = newBalance;
            new_invo.previousdue = previousBalance;
            await Invoice.update(new_invo, { where: { id: new_invo?.id } });
            recalculatedInvoices.push(new_invo);
            previousBalance = newBalance;
        }
    } else {
        for (const invoice of nextInvoices) {
            const newBalance = previousBalance + invoice.total - invoice.paidamount + invoice.return;
            const new_invo = invoice.get({ plain: true });
            new_invo.balance = newBalance;
            new_invo.previousdue = previousBalance;
            await Invoice.update(new_invo, { where: { id: new_invo?.id } });
            recalculatedInvoices.push(new_invo);
            previousBalance = newBalance;
        }
    }

    const last_invoice = await Invoice.findOne({
        where: {
            userId: userId,
            active: true,
        },
        order: [["id", "DESC"]],
    });

    await Customer.update({ balance: last_invoice?.balance }, { where: { id: userId } });

    return recalculatedInvoices
}

exports.recalculateNextInvoices = async (req, res) => {
    let recalculatedInvoices = ReCalculate(req?.body?.userId)
    return res.status(200).send({
        success: true,
        message: "Invoice Calculate Successfull",
        invoice: recalculatedInvoices

    })
};





exports.CreateOrder = async (req, res) => {

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, methodname, status,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, paymentmethod, sup_invo, special_discount } = req.body;

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
            status: status,
            pay_type: "You Receive",
            type: "Sale",
            deliverydate: deliverydate,
            balance: amount,
            special_discount: special_discount,
            sup_invo: sup_invo
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

        if (user) { await Customer.update({ balance: amount }, { where: { id: userId } }); }

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

    const { shop, customername, orders, userId, lastdiscount, date, packing, status, paidamount, amount,
        delivery, total, deliverydate, paymentmethod, methodname, sup_invo, special_discount } = req.body;

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
            total: 0,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: user?.balance,
            paidamount: paidamount,
            return: total,
            due: 0,
            pay_type: "You Pay",
            status: status,
            type: "Sale Return",
            deliverydate: deliverydate,
            balance: amount,
            special_discount: special_discount,
            sup_invo: sup_invo
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

        if (user) { await Customer.update({ balance: amount }, { where: { id: userId } }); }

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


exports.EditSaleOrder = async (req, res) => {

    const { invoice, allData } = req.body;

    try {

        const PrevInvoice = await Invoice.findOne({ where: { id: invoice?.id } })
        const user = await Customer.findOne({ where: { id: PrevInvoice?.userId } });
        if (user) {
            const adjustedBalance = user.balance + PrevInvoice?.due;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: user?.id } }
            );
        }
        await ReCalculate(PrevInvoice?.userId)
        let ReturnDatas = await SaleOrder.findAll({ where: { invoice_id: PrevInvoice?.id, active: true } })
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


        await Invoice.update(invoice, { where: { id: invoice?.id } });
        const Invo = await Invoice.findOne({ where: { id: invoice?.id } });
        const updated_user = await Customer.findOne({ where: { id: Invo?.userId } });
        if (updated_user) {
            const adjustedBalance = updated_user.balance - invoice?.due;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: updated_user?.id } }
            );
        }
        const updatedOrders = allData.map(order => ({
            ...order,
            invoice_id: invoice?.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));
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
        await ReCalculate(invoice?.userId)
        return res.status(200).send({
            success: true,
            message: "Update Order Successfull",
            invoice: invoice?.id,
            updated_invoices: updated_invoices

        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.EditSaleReturn = async (req, res) => {

    const { invoice, allData } = req.body;

    try {

        const PrevInvoice = await Invoice.findOne({ where: { id: invoice?.id } })
        const user = await Customer.findOne({ where: { id: PrevInvoice?.userId } });
        if (user) {
            let pay_amount = PrevInvoice?.return + PrevInvoice?.paidamount
            const adjustedBalance = user.balance - pay_amount;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: user?.id } }
            );
        }
        await ReCalculate(PrevInvoice?.userId)
        let ReturnDatas = await SaleOrder.findAll({ where: { invoice_id: PrevInvoice?.id, active: true } })
        await Promise.all(ReturnDatas?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product.qty) - parseInt(pro.qty) },
                    { where: { id: product.id } }
                );
            }
        }));
        let DeleteData = await SaleOrder.update(
            { active: false },
            { where: { invoice_id: invoice?.id } }
        );

        await Invoice.update(invoicenew_invooice, { where: { id: invoice?.id } });
        const Invo = await Invoice.findOne({ where: { id: invoice?.id } });
        const updated_user = await Customer.findOne({ where: { id: invoice?.userId } });
        if (updated_user) {
            const adjustedBalance = updated_user.balance + invoice?.return + invoice?.paidamount;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: updated_user?.id } }
            );
        }
        const updatedOrders = allData.map(order => ({
            ...order,
            invoice_id: Invo?.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));
        await SaleOrder.bulkCreate(updatedOrders);
        await Promise.all(updatedOrders?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product?.qty) + parseInt(pro?.qty) },
                    { where: { id: product.id } }
                );
            }
        }));
        await ReCalculate(invoice?.userId)
        return res.status(200).send({
            success: true,
            message: "Update Order Successfull",
            invoice: invoice?.id,
            updated_invoices: updated_invoices

        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.EditPurchaseReturn = async (req, res) => {

    const { invoice, allData } = req.body;

    try {

        const PrevInvoice = await Invoice.findOne({ where: { id: invoice?.id } })
        const user = await Customer.findOne({ where: { id: PrevInvoice?.userId } });
        if (user) {
            let pay_amount = PrevInvoice?.return + PrevInvoice?.paidamount
            const adjustedBalance = user.balance + pay_amount;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: user?.id } }
            );
        }
        await ReCalculate(PrevInvoice?.userId)
        let ReturnDatas = await SaleOrder.findAll({ where: { invoice_id: PrevInvoice?.id, active: true } })
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

        await Invoice.update(invoice, { where: { id: invoice?.id } });
        const Invo = await Invoice.findOne({ where: { id: invoice?.id } });
        const updated_user = await Customer.findOne({ where: { id: invoice?.userId } });
        if (updated_user) {
            const adjustedBalance = updated_user.balance - invoice?.total - invoice?.paidamount;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: updated_user?.id } }
            );
        }
        const updatedOrders = allData.map(order => ({
            ...order,
            invoice_id: Invo?.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));
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
        await ReCalculate(invoice?.userId)
        return res.status(200).send({
            success: true,
            message: "Update Order Successfull",
            invoice: invoice?.id,
            updated_invoices: updated_invoices

        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.EditPurchaseOrder = async (req, res) => {

    const { invoice, allData } = req.body;

    try {

        const PrevInvoice = await Invoice.findOne({ where: { id: invoice?.id } })
        const user = await Customer.findOne({ where: { id: PrevInvoice?.userId } });
        if (user) {
            const adjustedBalance = user.balance - PrevInvoice?.due;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: user?.id } }
            );
        }
        await ReCalculate(PrevInvoice?.userId)
        let ReturnDatas = await SaleOrder.findAll({ where: { invoice_id: PrevInvoice?.id, active: true } })
        await Promise.all(ReturnDatas?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product.qty) - parseInt(pro.qty) },
                    { where: { id: product.id } }
                );
            }
        }));
        let DeleteData = await SaleOrder.update(
            { active: false },
            { where: { invoice_id: invoice?.id } }
        );


        const prevInvoice = await Invoice.findOne({
            where: {
                userId: invoice?.userId,
                id: { [Op.lt]: invoice?.id },
                active: true,
            },
            order: [["id", "DESC"]],
        });



        await Invoice.update(invoice, { where: { id: invoice?.id } });
        const Invo = await Invoice.findOne({ where: { id: invoice?.id } });
        const updated_user = await Customer.findOne({ where: { id: Invo?.userId } });
        if (updated_user) {
            const adjustedBalance = updated_user.balance + invoice?.due;
            await Customer.update(
                { balance: adjustedBalance },
                { where: { id: updated_user?.id } }
            );
        }
        const updatedOrders = allData.map(order => ({
            ...order,
            invoice_id: invoice?.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));
        await SaleOrder.bulkCreate(updatedOrders);
        await Promise.all(updatedOrders?.map(async (pro) => {
            const product = await Product.findOne({ where: { id: pro?.product_id } });
            if (product) {
                await Product.update(
                    { qty: parseInt(product?.qty) + parseInt(pro?.qty) },
                    { where: { id: product.id } }
                );
            }
        }));
        await ReCalculate(invoice?.userId)
        return res.status(200).send({
            success: true,
            message: "Update Order Successfull",
            invoice: invoice?.id,
            updated_invoices: updated_invoices

        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.ReturnPurchase = async (req, res) => {

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, methodname, status,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, paymentmethod, sup_invo, special_discount } = req.body;

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
            total: 0,
            methodname: methodname,
            paymentmethod: paymentmethod,
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: previousdue,
            paidamount: paidamount,
            return: total,
            pay_type: "You Receive",
            due: 0,
            status: status,
            type: "Return Purchase",
            deliverydate: deliverydate,
            balance: amount,
            special_discount: special_discount,
            sup_invo: sup_invo
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


        if (user) { await Customer.update({ balance: amount }, { where: { id: userId } }); }


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

    const { shop, customername, orders, userId, amount, lastdiscount, pay_type, paymentmethod, methodname, status,
        previousdue, paidamount, date, packing, delivery, total, deliverydate, updatedata, sup_invo, special_discount } = req.body;

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
            status: status,
            pay_type: "You Pay",
            type: "Purchase items",
            deliverydate: deliverydate,
            balance: amount,
            special_discount: special_discount,
            sup_invo: sup_invo
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
            await Customer.update({ balance: amount }, { where: { id: userId } });
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



exports.SearchOrder = async (req, res) => {
    try {
        const { name } = req.params;

        const whereClause = {
            compId: req?.compId,
            active: true,
        };

        if (name) {
            whereClause[Op.or] = [
                { id: { [Op.like]: `%${name}%` } },
                { customername: { [Op.like]: `%${name}%` } },
                { type: { [Op.like]: `%${name}%` } }
            ];
        }

        const data = await Invoice.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
        });

        // Initialize opening
        let opening = null;

        if (data.length > 0) {
            // Find the earliest createdAt date in your results
            const lastCreatedDate = data[data.length - 1].createdAt;

            // Get one invoice before that date (the opening)
            opening = await db.invoice.findOne({
                where: {
                    compId: req?.compId,
                    active: true,
                    createdAt: { [Op.lt]: lastCreatedDate },
                },
                order: [["createdAt", "DESC"]],
            });
        }

        return res.status(200).send({
            success: true,
            items: data,
            opening: opening,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
};





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
                methodname: item?.methodname,
                paymentmethod: item?.paymentmethod,
                packing: item?.packing,
                delivery: item?.delivery,
                lastdiscount: item?.lastdiscount,
                customername: item?.customername,
                previousdue: item?.previousdue,
                paidamount: item?.total,
                due: item?.due,
                status: item?.status,
                is_edit: false,
                order_type: "Offline",
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


