const db = require("../models");
const SaleOrder = db.saleorder;
const Customer = db.customer;
const Product = db.product;
const Invoice = db.invoice;
const Op = db.Sequelize.Op;
const { fn, col } = require("sequelize");
// const { Op } = require('sequelize');


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
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.getOrder = async (req, res) => {

    try {
        let data = await SaleOrder.findAll({
            limit: 10,
            where: {
                invoice_id: req.params.id,
                compId: req?.compId,
                active: true
            },
            include: [
                {
                    model: Product,
                    include: [
                        { model: db.brand },
                        { model: db.category }
                    ]

                }
            ]
        })


        let invo = await db.invoice.findOne({
            where: {
                id: req.params.id
            }
        })

        const nextInvo = await Invoice.findOne({
            where: {
                id: { [Op.gt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'ASC']]
        });

        const prevInvo = await Invoice.findOne({
            where: {
                id: { [Op.lt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']]
        });


        const lastInvo = await Invoice.findOne({
            where: {
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']],
            limit: 1
        });



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
            state: state?.name,
            address: user?.address,
            packing: invo?.packing,
            delivery: invo?.delivery,
            lastdiscount: invo?.lastdiscount,
            previousdue: invo?.previousdue,
            paidamount: invo?.paidamount,
            type: invo?.type,
            date: invo?.date
        };



        return res.status(200).send({
            success: true,
            items: data,
            user: userData,
            invoice: invo,
            nextInvo: nextInvo,
            prevInvo: prevInvo,
            lastInvo: lastInvo
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}


exports.getOrderInvo = async (req, res) => {

    try {

        let invo = await db.invoice.findOne({
            where: {
                id: req.params.id
            }
        })

        const nextInvo = await Invoice.findOne({
            where: {
                id: { [Op.gt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'ASC']]
        });

        const prevInvo = await Invoice.findOne({
            where: {
                id: { [Op.lt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']]
        });


        const lastInvo = await Invoice.findOne({
            where: {
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']],
            limit: 1
        });



        let user = await Customer.findOne({
            where: {
                id: invo?.userId
            }
        })

        let state = await db.state.findOne({
            where: {
                id: user?.stateId
            }
        })



        return res.status(200).send({
            success: true,
            invoice: invo,
            nextInvo: nextInvo,
            prevInvo: prevInvo,
            lastInvo: lastInvo,
            state:state,
            user:user
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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
                compId: req?.compId,
                type: "Sale"
            },
            limit: 300,
            order: [["createdAt", "DESC"]]
        })
        const calcutatedData = await groupSalesByHour(data);

        return res.status(200).send({
            success: true,
            items: calcutatedData
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}


exports.getDailySalseReturnPurchase = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sale = await SaleOrder.findOne({
            where: {
                createdAt: { [Op.gte]: today },
                compId: req?.compId,
                type: "Sale Return"
            },
            attributes: [[fn("SUM", col("sellprice")), "totalAmount"]],
            raw: true
        });

        const purchase = await SaleOrder.findOne({
            where: {
                createdAt: { [Op.gte]: today },
                compId: req?.compId,
                type: "Purchase Items"
            },
            attributes: [[fn("SUM", col("sellprice")), "totalAmount"]],
            raw: true
        });

        return res.status(200).send({
            success: true,
            returnsale: sale?.totalAmount || 0,
            purchasesale: purchase?.totalAmount || 0
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};



exports.RecentInvoice = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let data = await Invoice.findAll({
            where: { compId: req?.compId, active: true },
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        const totalInvoices = await Invoice.count({ where: { compId: req?.compId } });
        const totalPages = Math.ceil(totalInvoices / pageSize);

        return res.status(200).send({
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalInvoices,
            items: data,
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

exports.RecentPurchase = async (req, res) => {
    try {
        const type = req.body.type
        const page = parseInt(req.params.page) || 1;
        const pageSize = parseInt(req.params.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        let whereClouse = { active: true, compId: req?.compId, type: type }

        if (req.body.userId !== null && req.body.userId !== undefined) {
            whereClouse['userId'] = req.body.userId;
        }

        let data = await Invoice.findAll({
            where: whereClouse,
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        const totalInvoices = await Invoice.count({ where: whereClouse });
        const totalPages = Math.ceil(totalInvoices / pageSize);

        return res.status(200).send({
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalInvoices,
            items: data,
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
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

        return res.status(200).send({
            success: true,
            items: dataPoints
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};


exports.OrderFromTo = async (req, res) => {
    const { fromDate, toDate } = req.body;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;


    let whereClouse = {
        active: true,
        compId: req?.compId,
        createdAt: {
            [Op.between]: [from, to],
        }
    }
    if (req.body.userId !== null && req.body.userId !== undefined) {
        whereClouse['userId'] = req.body.userId;
    }
    if (req.body.type !== null && req.body.type !== undefined) {
        whereClouse['type'] = req.body.type;
    }

    try {
        const data = await Invoice.findAll({
            where: whereClouse,
            limit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        const count = await Invoice.count({ where: whereClouse });

        return res.status(200).send({
            success: true,
            compId: req?.compId,
            items: data,
            count: count
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};




