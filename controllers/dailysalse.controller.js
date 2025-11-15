const db = require("../models");
const SaleOrder = db.saleorder;
const Customer = db.customer;
const Product = db.product;
const Invoice = db.invoice;
const Op = db.Sequelize.Op;
const { fn, col, where, Sequelize } = require("sequelize");



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

function FormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

exports.getOrderSummary = async (req, res) => {
    const date = FormattedDate()
    try {
        const saleOrderSum = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('total')), 'totalSellPrice']],
            where: {
                compId: req?.compId,
                type: 'Sale',
                created_date: date
            },
            raw: true
        });

        const purchaseOrderSum = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('total')), 'totalSellPrice']],
            where: {
                compId: req?.compId,
                type: 'Purchase items',
                created_date: date
            },
            raw: true
        });

        const cashCollection = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('paidamount')), 'paid']],
            where: {
                compId: req?.compId,
                type: 'Sale',
                created_date: date
            },
            raw: true
        });

        const onlineCollection = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('paidamount')), 'paid']],
            where: {
                compId: req?.compId,
                type: 'Make Payment',
                created_date: date
            },
            raw: true
        });

        const saleReturn = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('return')), 'return']],
            where: {
                compId: req?.compId,
                type: 'Sale Return',
                created_date: date
            },
            raw: true
        });

        const PurchaseReturn = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('return')), 'p_return']],
            where: {
                compId: req?.compId,
                type: 'Return Purchase',
                created_date: date
            },
            raw: true
        });

        const Expense = await Invoice.findOne({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('total')), 'expense']],
            where: {
                compId: req?.compId,
                type: 'Expense',
                created_date: date
            },
            raw: true
        });


        return res.status(200).send({
            success: true,
            items: {
                sale: saleOrderSum?.totalSellPrice || 0,
                purchase: purchaseOrderSum?.totalSellPrice || 0,
                cash: cashCollection?.paid || 0,
                online: onlineCollection?.paid || 0,
                return: saleReturn?.return || 0,
                pur_return: PurchaseReturn?.p_return || 0,
                expense: Expense?.expense || 0,
                nagad: 0

            }
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.getSingleInvoice = async (req, res) => {
    try {
        let data = await Invoice.findOne({
            where: {
                id: req?.params?.id
            }
        })
        let user = await db.customer.findAll({
            where: {
                id: data?.userId,
                active: true
            }
        })
        return res.status(200).send({
            success: true,
            items: data,
            user: user
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.DeleteInvoice = async (req, res) => {
    try {

        let data = await Invoice.findOne({
            where: { id: req?.params?.id }
        });

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Invoice not found"
            });
        }

        let amount = 0;
        if (data?.pay_type === "You Pay") {
            amount = data?.paidamount;
        } else if (data?.pay_type === "You Receive") {
            amount = data?.paidamount * -1;
        }

        let user = await db.customer.findOne({
            where: { id: data?.userId }
        });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        const updatedBalance = user.balance + amount;
        await user.update({ balance: updatedBalance });

        await data.update({ active: false });

        return res.status(200).send({
            success: true,
            message: "Invoice deleted successfully",
            newBalance: updatedBalance
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};


function getFormattedDate() {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-EN', options);
}

exports.getExpense = async (req, res) => {
    let date = getFormattedDate()
    try {
        let data = await Invoice.findAll({
            where: {
                active: true,
                date: req.body.date,
                compId: req.compId
            }
        });
        let opening = await db.opening.findOne({
            where: {
                active: true,
                date: req.body.date,
                compId: req.compId
            }
        })
        let grand_total = 0
        let hand_cash = 0

        const allSales = data?.filter(item => item.type === "Sale");
        const pur_Expense = data?.filter(item => item.type === "Expense");
        const paidSale = data?.filter(item => item.type === "Sale" && item.paidamount > 0);
        const party_collections = data?.filter(item => item.type === "Make Payment");
        const sale_return = data?.filter(item => item.type === "Sale Return");
        const onli_col = data?.filter(item => item.type === "Online Collection");


        let pre_final = {
            name: "Income",
            total: 0,
            paidamount: 0,
            items: [{
                customername: "Opening Sale",
                type: "Income",
                id: 0,
                total: opening?.amount || 0,
                paidamount: opening?.amount || 0
            }]
        };

        let cash_sale = {
            customername: "Cash Sale",
            type: "Income",
            id: 0,
            total: 0,
            paidamount: 0
        }
        paidSale?.forEach((item) => {
            cash_sale.total += item?.total ?? 0;
            cash_sale.paidamount += item?.paidamount ?? 0;
        });
        pre_final.items.push({
            customername: "Cash Balance",
            type: "Income",
            id: 0,
            total: cash_sale?.total,
            paidamount: cash_sale?.paidamount
        });


        let party_col = {
            name: "Party Collections",
            total: 0,
            paidamount: 0,
            items: party_collections
        };
        party_collections?.forEach((item) => {
            party_col.total += item?.total ?? 0;
            party_col.paidamount += item?.paidamount ?? 0;
        });
        pre_final.items.push({
            customername: "Cash Collections",
            type: "Income",
            id: 0,
            total: party_col?.total,
            paidamount: party_col?.paidamount
        });





        let online_collection = {
            name: "Online Collections",
            total: 0,
            paidamount: 0,
            items: onli_col
        };
        onli_col?.forEach((item) => {
            online_collection.total += item?.total ?? 0;
            online_collection.paidamount += item?.paidamount ?? 0;
        });
        pre_final.items.push({
            customername: "Online Collections",
            type: "Income",
            id: 0,
            total: online_collection?.total,
            paidamount: online_collection?.paidamount
        });




        let party_ret = {
            name: "Party Return",
            total: 0,
            paidamount: 0,
            items: sale_return
        };
        sale_return?.forEach((item) => {
            party_ret.total += item?.total ?? 0;
            party_ret.paidamount += item?.paidamount ?? 0;
        });
        let total_income = 0
        pre_final?.items?.forEach((item) => {
            pre_final.total += item?.total ?? 0;
            pre_final.paidamount += item?.paidamount ?? 0;
            total_income += item?.paidamount ?? 0;
        });

        let final_data = [pre_final];



        // Expense
        let total_expense = 0
        let ex_list = pur_Expense?.map(item => ({
            id: item?.id,
            type: item?.type,
            customername: `${item?.methodname} -- ${item?.note}`,
            total: item?.total,
            paidamount: item?.paidamount
        }));
        let expense = {
            name: "Expense",
            total: 0,
            paidamount: 0,
            items: ex_list
        };
        pur_Expense?.forEach((item) => {
            expense.total += item?.total ?? 0;
            expense.paidamount += item?.paidamount ?? 0;
            total_expense += item.total
        });
        final_data.push(expense)

        // Part Collections
        final_data.push(party_col)
        hand_cash += party_col?.total


        // Party Sales
        let party_sale = {
            name: "Party Sales",
            total: 0,
            paidamount: 0,
            items: allSales
        };
        allSales?.forEach((item) => {
            party_sale.total += item?.total ?? 0;
            party_sale.paidamount += item?.paidamount ?? 0;
        });
        final_data.push(party_sale)
        hand_cash += party_sale?.total

        // Online Collections
        final_data.push(online_collection)
        hand_cash += online_collection?.total


        // Party Return
        final_data.push(party_ret)
        hand_cash += party_ret?.total



        return res.status(200).send({
            success: true,
            items: data,
            final_data: final_data,
            grand_total: grand_total,
            hand_cash: total_income - total_expense,
            party_col: party_col,
            online_collection: online_collection,
            party_ret: party_ret,
            party_sale: party_sale
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};


exports.CreateExpense = async (req, res) => {

    try {
        let data = await Invoice.create({
            date: req.body.date,
            compId: req?.compId,
            shopname: req.body.shopname,
            createdby: req.userId,
            creator: req?.user,
            userId: 142,
            total: req.body.paid,
            paymentmethod: "",
            methodname: req.body.methodname,
            packing: 0,
            delivery: 0,
            lastdiscount: 0,
            customername: `${req.body.expensename}`,
            previousdue: 0,
            paidamount: req.body.paid,
            due: 0,
            status: "Online",
            type: "Expense",
            deliverydate: getFormattedDate(),
            balance: req.body.paid,
            note: req.body.note
        })


        return res.status(200).send({
            success: true,
            items: data,
            message: "Expense Upload Succesfully"
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

exports.OpeningBalance = async (req, res) => {
    try {
        let payload = {
            date: req.body.date,
            compId: req?.compId,
            createdby: req.userId,
            creator: req?.user,
            amount: req.body.amount,
            type: "Opening",
            active: true
        };

        let data;
        if (req.body.id) {
            // Update
            await db.opening.update(payload, {
                where: { id: req.body.id, compId: req?.compId }
            });
            data = await db.opening.findOne({ where: { id: req.body.id, compId: req?.compId } });
        } else {
            // Create
            data = await db.opening.create(payload);
        }

        return res.status(200).send({
            success: true,
            items: data,
            message: req.body.id ? "Opening updated successfully" : "Opening created successfully"
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

exports.GetOpeningBalance = async (req, res) => {
    try {
        let data = await db.opening.findAll({
            where: {
                active: true,
                compId: req?.compId
            },
            limit: 15
        })

        return res.status(200).send({
            success: true,
            items: data,
            message: req.body.id ? "Opening updated successfully" : "Opening created successfully"
        });

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};


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
                type: req.params.type,
                id: { [Op.gt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'ASC']]
        });

        const prevInvo = await Invoice.findOne({
            where: {
                type: req.params.type,
                id: { [Op.lt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']]
        });


        const lastInvo = await Invoice.findOne({
            where: {
                type: req.params.type,
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
                type: req.params.type,
                id: { [Op.gt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'ASC']]
        });

        const prevInvo = await Invoice.findOne({
            where: {
                type: req.params.type,
                id: { [Op.lt]: req.params.id },
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']]
        });


        const lastInvo = await Invoice.findOne({
            where: {
                type: req.params.type,
                compId: req?.compId,
                active: true,
            },
            order: [['id', 'DESC']]
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
            state: state,
            user: user
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
                type: "Sale",
                active: true
            },
            limit: 300,
            order: [["createdAt", "DESC"]]
        })
        const amount = data.reduce((sum, item) => sum + (item.paidamount || 0), 0);
        const calcutatedData = await groupSalesByHour(data);

        return res.status(200).send({
            success: true,
            items: calcutatedData,
            amount: amount
        })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.GetTodaySale = async (req, res) => {

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let data = await db.invoice.findAll({
            where: {
                createdAt: { [Op.gte]: today },
                compId: req?.compId,
                type: "Sale",
                active: true
            },
            limit: 300,
            order: [["createdAt", "DESC"]]
        })
        const amount = data.reduce((sum, item) => sum + (item.paidamount || 0), 0);


        return res.status(200).send({
            success: true,
            amount: amount
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
            include: [{
                model: db.customer
            }]
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

    if (!fromDate || !toDate) {
        return res.status(400).send({ success: false, message: "fromDate and toDate are required." });
    }

    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;


    let whereClouse = {
        active: true,
        compId: req?.compId,
        created_date: {
            [Op.between]: [fromDate, toDate],
        }
    }
    if (req.body.userId !== null && req.body.userId !== undefined) {
        whereClouse['userId'] = req.body.userId;
    }
    if (req.body.type !== null && req.body.type !== undefined) {
        whereClouse['type'] = req.body.type;
    }
    if (req.body.comId !== null && req.body.comId !== undefined) {
        whereClouse['compId'] = req.body.comId;
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




