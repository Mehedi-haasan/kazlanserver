const db = require("../models");
const SaleOrder = db.saleorder;
const Customer = db.customer;
const Product = db.product;
const Notification = db.notification;
const Invoice = db.invoice;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;


exports.getAllOrder = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await SaleOrder.findAll({
            limit: pageSize,
            offset: offset,
            include: [
                {
                    model: Product,

                }
            ],
            order: [["createdAt", "DESC"]],
            where: {
                compId: req?.compId
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

exports.getOrder = async (req, res) => {

    try {
        let data = await SaleOrder.findAll({
            limit: 10,
            where: {
                invoice_id: req.params.id,
                compId: req?.compId
            },
            include: [
                {
                    model: Product,

                }
            ]
        })



        let user = await Customer.findOne({
            where: {
                id: data[0]?.userId
            }
        })

        let state = await db.state.findOne({
            where: {
                id: user?.stateId
            }
        })

        let userData = {
            ...user?.toJSON(),
            state: state?.name
        };


        res.status(200).send({
            success: true,
            items: data,
            user: userData,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

function getFormattedDate() {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('bn-BD', options);
}

exports.getTodatOrder = async (req, res) => {

    try {
        let data = await SaleOrder.findAll({
            where: {
                date: getFormattedDate(),
                compId: req?.compId
            },
            include: [
                {
                    model: Product,
                }
            ]
        })
        res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

async function groupSalesByHour(items) {
    const groupedSales = {};

    items.forEach(item => {
        const date = new Date(item.createdAt);
        const hour = date.getHours();

        if (!groupedSales[hour]) {
            groupedSales[hour] = { h: hour, sales: 0 };
        }

        groupedSales[hour].sales += item.price * item.qty;
    });

    return Object.values(groupedSales).sort((a, b) => a.h - b.h);
}

exports.getDailySalse = async (req, res) => {

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let data = await SaleOrder.findAll({
            where: {
                createdAt: { [Op.gte]: today },
                compId: req?.compId
            },
            limit: 300,
            order: [["createdAt", "DESC"]]
        })
        const calcutatedData = await groupSalesByHour(data);

        res.status(200).send({
            success: true,
            items: calcutatedData
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const UpdateProduct = async (orders) => {
    const updateProducts = orders

    if (!Array.isArray(updateProducts) || updateProducts.length === 0) {
        return 0
    }

    try {
        const Products = [];

        for (const pro of updateProducts) {
            const product = await Product.findOne({
                where: { id: pro?.product_id },
            });

            if (product) {
                await Product.update(
                    {
                        qty: parseInt(product?.qty) - parseInt(pro?.qty),
                    },
                    {
                        where: {
                            id: product?.id,
                        },
                    }
                );

            } else {
                console.log(`Product with ID ${pro?.id} not found`);
            }
        }

        return Products
    } catch (error) {
        return error
    }
};


const UserDueCreate = async (userId, amount) => {

    try {
        const user = await Customer.findOne({ where: { id: userId } });

        if (user) {
            await Customer.update(
                { balance: user.balance + amount },
                { where: { id: userId } }
            );
        }

        return 0
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.CreateOrder = async (req, res) => {

    const { shop, customername, orders, userId, amount, total, previousdue, paidamount, date, packing, delivery, lastdiscount } = req.body;

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
            packing: packing,
            delivery: delivery,
            lastdiscount: lastdiscount,
            customername: customername,
            previousdue: previousdue,
            paidamount: paidamount,
            due: (total + previousdue) - paidamount,
            status: total <= paidamount ? 'PAID' : 'DUE'
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        const updatedOrders = orders.map(order => ({
            ...order,
            invoice_id: invoice.id,
            compId: req?.compId,
            createdby: req?.userId,
            creator: req?.user
        }));


        await SaleOrder.bulkCreate(updatedOrders);

        // Update product stock
        const data = await UpdateProduct(updatedOrders);
        const userDue = await UserDueCreate(userId, amount);
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
        res.status(200).send({
            success: true,
            message: "Order Create Successfull",
            data: data,
            userDue: userDue

        })

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.RecentInvoice = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let data = await Invoice.findAll({
            where: { compId: req?.compId },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        const totalInvoices = await Invoice.count({ where: { compId: req?.compId } });
        const totalPages = Math.ceil(totalInvoices / pageSize);

        res.status(200).send({
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalInvoices,
            items: data,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};


const groupByDay = async (orders) => {
    return orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];

        if (!acc[date]) {
            acc[date] = { totalSales: 0 };
        }

        acc[date].totalSales += order?.price * order?.qty || 0;

        return acc;
    }, {});
};

exports.getMonthlyOrder = async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let data = await SaleOrder.findAll({
            where: {
                createdAt: { [Op.gte]: firstDayOfMonth },
                compId: req?.compId
            },
            limit: 500,
            order: [["createdAt", "DESC"]]
        });

        const groupedOrders = await groupByDay(data);


        const dataPoints = Object.entries(groupedOrders).map(([dateStr, data]) => ({
            x: new Date(dateStr),
            y: data.totalSales
        }));

        dataPoints.sort((a, b) => a.x - b.x);

        res.status(200).send({
            success: true,
            items: dataPoints
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const updatedQty = async (data, transaction) => {
    for (const pro of data) {
        const product = await Product.findOne({ where: { id: pro?.product_id }, transaction });

        if (product) {
            const currentQty = parseInt(product.qty) || 0;
            const returnQty = parseInt(pro?.qty) || 0;
            const updatedQty = currentQty + returnQty;

            await Product.update(
                { qty: updatedQty },
                { where: { id: product.id }, transaction }
            );
        } else {
            throw new Error(`Product with ID ${pro?.product_id} not found`);
        }
    }
};






exports.ReturnSale = async (req, res) => {
    const { data, invoiceId, total, returnamount, shopname, userId, customername, date } = req.body;

    let transaction;
    try {
        transaction = await sequelize.transaction();

        await updatedQty(data, transaction);

        const invo = await Invoice.findOne({ where: { id: invoiceId }, transaction });
        const due = await Customer.findOne({ where: { id: invo?.userId }, transaction });

        if (due) {
            const updatedDue = parseInt(due.balance) - parseInt(returnamount);
            await Customer.update(
                { balance: updatedDue },
                { where: { id: invo?.userId }, transaction }
            );
        }

        const invoice = await Invoice.create({
            date: date,
            compId: req?.compId,
            shopname,
            createdby: req.userId,
            creator: req?.user,
            userId,
            total: 0,
            packing: 0,
            delivery: 0,
            lastdiscount: 0,
            customername,
            previousdue: due?.balance,
            paidamount: returnamount,
            due: 0,
            status: 'Return'
        }, { transaction });


        console.log("Update");
        let orders = [];

        data?.map(v => (
            orders.push({
                active: true,
                invoice_id: invoice.id,
                compId: req?.compId,
                createdby: req?.userId,
                creator: req?.user,
                product_id: v?.product_id,
                username: v?.username,
                userId: v?.userId,
                name: v?.name,
                shop: v?.shopname,
                price: v?.price,
                discount: v?.discount,
                sellprice: (v?.price * v?.qty),
                qty: v?.qty,
                contact: v?.phone,
                date: date
            })
        ));

        console.log("Update 2");
        await SaleOrder.bulkCreate(orders, { transaction });
        console.log("Update 3");
        await transaction.commit();
        return res.status(200).send({
            success: true,
            message: "Product returned successfully",
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(500).send({ success: false, message: error.message });
    }
};




exports.ReturnPurchase = async (req, res) => {
    const { data, userId, total } = req.body;


    let transaction;

    try {
        transaction = await sequelize.transaction();
        for (const pro of data) {
            const product = await Product.findOne({ where: { id: pro?.id } });

            if (product) {
                const currentQty = parseInt(product.qty) || 0;
                const returnQty = parseInt(pro?.qty) || 0;
                const updatedQty = currentQty - returnQty;

                await Product.update({ qty: updatedQty }, { where: { id: product.id } });
            } else {
                console.log(`Product with ID ${pro?.id} not found`);
            }
        }
        const due = await Customer.findOne({ where: { id: userId }, transaction });
        if (due) {
            const updatedDue = parseInt(due.balance) + parseInt(total);
            await Customer.update({ balance: updatedDue }, { where: { id: userId }, transaction });
        }
        await transaction.commit();
        res.status(200).send({
            success: true,
            message: "Product returned successfully",
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error in ReturnSale:", error);
        res.status(500).send({ success: false, message: error.message });
    }
};




// exports.ReturnSale = async (req, res) => {
//     const { data, invoiceId, total, returnamount } = req.body;
//     if (!invoiceId) {
//         return res.status(400).send({
//             success: false,
//             message: "Invoice ID is required",
//         });
//     }

//     let transaction;

//     try {
//         transaction = await sequelize.transaction();

//         for (const pro of data) {
//             const product = await Product.findOne({ where: { id: pro?.product_id }, transaction });

//             if (product) {
//                 const currentQty = parseInt(product.qty) || 0;
//                 const returnQty = parseInt(pro?.qty) || 0;
//                 const updatedQty = currentQty + returnQty;

//                 await Product.update({ qty: updatedQty }, { where: { id: product.id }, transaction });
//             } else {
//                 throw new Error(`Product with ID ${pro?.product_id} not found`);
//             }
//         }

//         const InvoiceData = await Invoice.findOne({ where: { id: invoiceId }, transaction });
//         if (InvoiceData) {
//             if (total === 0) {
//                 await Invoice.destroy({ where: { id: invoiceId }, transaction });
//                 await SaleOrder.destroy({ where: { invoice_id: invoiceId }, transaction });
//                 await Notification.destroy({ where: { invoiceId: invoiceId }, transaction });
//                 const due = await Customer.findOne({ where: { id: InvoiceData?.userId }, transaction });
//                 if (due) {
//                     const updatedDue = parseInt(due.balance) - parseInt(InvoiceData.paidamount);
//                     await Customer.update({ balance: updatedDue }, { where: { id: InvoiceData.userId }, transaction });
//                 }
//             } else {
//                 await db.invoice.update({
//                     total: total,
//                     previousdue: InvoiceData?.previousdue,
//                     paidamount: InvoiceData?.paidamount,
//                     due: InvoiceData?.due + returnamount
//                 }, { where: { id: InvoiceData.id }, transaction });


//                 for (const pro of data) {
//                     if (parseInt(pro?.qty) === 0) {
//                         await SaleOrder.destroy({ where: { id: pro?.id } })
//                     } else {
//                         await SaleOrder.update({
//                             price: pro?.price,
//                             discount: pro?.discount,
//                             sellprice: pro?.sellprice,
//                             qty: pro?.qty
//                         },
//                             { where: { invoice_id: invoiceId }, transaction });
//                     }
//                 }

//                 const due = await Customer.findOne({ where: { id: InvoiceData?.userId }, transaction });
//                 if (due) {
//                     const updatedDue = parseInt(due.balance) + parseInt(returnamount);
//                     await Customer.update({ balance: updatedDue }, { where: { id: InvoiceData.userId }, transaction });
//                 }
//             }

//         }

//         await transaction.commit();

//         return res.status(200).send({
//             success: true,
//             message: "Product returned successfully",
//         });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Error in ReturnSale:", error);
//         return res.status(500).send({ success: false, message: error.message });
//     }
// };