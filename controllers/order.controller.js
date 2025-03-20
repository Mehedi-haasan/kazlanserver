const db = require("../models");
const SaleOrder = db.saleorder;
const UserDue = db.userdue;
const Customer = db.customer;
const User = db.user;
const Product = db.product;
const Notification = db.notification;
const Invoice = db.invoice;
const Op = db.Sequelize.Op;


exports.getAllOrder = async (req, res) => {

    try {
        let data = await SaleOrder.findAll({
            limit: 14,
            include: [
                {
                    model: Product,

                }
            ],
            order: [["createdAt", "DESC"]]
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
                createdby: req?.userId
            },
            include: [
                {
                    model: Product,

                },
                {
                    model: User,
                    include: [
                        {
                            model: db.state
                        }
                    ]
                }
            ]
        })

        let due = await UserDue.findOne({
            where: {
                userId: data[0]?.userId
            }
        })

        let resdata = [];
        let user = data?.length > 0 ? {
            name: data[0]?.user?.first_name + " " + data[0]?.user?.last_name,
            contact: data[0]?.contact,
            date: data[0]?.date,
            invoice_id: data[0]?.invoice_id,
            discount: data[0]?.discount,
            state: data[0]?.user?.state?.name,
            discountType: data[0]?.discountType,
            due: due?.amount || 0

        } : null

        data?.map((item) => {
            resdata.push({
                "id": item?.product?.id,
                "active": null,
                "product_type": true,
                "categoryId": item?.product?.categoryId,
                "name": item?.product?.name,
                "description": item?.product?.description,
                "image_url": item?.product?.image_url,
                "cost": item?.product?.cost,
                "price": item?.product?.price,
                "standard_price": item?.product?.standard_price,
                "qty": item?.qty,
                "createdAt": "2025-02-20T17:50:42.000Z",
                "updatedAt": "2025-02-20T17:53:22.000Z"
            })
        })

        res.status(200).send({
            success: true,
            items: resdata,
            user: user,
            due: due
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
                createdby: req?.userId
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
                createdAt: { [Op.gte]: today }
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
    try {
        const { shop, orders, userId, amount, total, previousdue, paidamount, date } = req.body;
        const invoice = await Invoice.create({
            date: date,
            shop: shop,
            createdby: req.userId,
            userId: userId,
            total: total,
            previousdue: previousdue,
            paidamount: paidamount,
            due: (total + previousdue) - paidamount,
            status: total <= paidamount ? 'PAID' : 'UNPAID'
        });
        if (!invoice || !invoice.id) {
            return res.status(400).send({ success: false, message: "Failed to create invoice" });
        }

        // Assign the correct invoice_id to each order
        const updatedOrders = orders.map(order => ({
            ...order,
            invoice_id: invoice.id,
            createdby: req?.userId
        }));

        // Bulk insert sale orders with the correct invoice_id
        await SaleOrder.bulkCreate(updatedOrders);

        // Update product stock
        const data = await UpdateProduct(updatedOrders);
        const userDue = await UserDueCreate(userId, amount);
        await Notification.create({
            isSeen: 'false',
            status: 'success',
            userId: userId,
            invoiceId: invoice.id,
            createdby: req?.userId
        });
        res.status(200).send({
            success: true,
            message: "Order Create Successfull",
            data: data,
            userDue: userDue

        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.RecentInvoice = async (req, res) => {
    try {
        let data = await Invoice.findAll({
            where: {
                createdby: req?.userId
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
                createdby: req?.userId
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


exports.ReturnSale = async (req, res) => {
    const { data, invoiceId } = req.body;

    // Validate request body
    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).send({
            success: false,
            message: "Invalid or empty product update data",
        });
    }

    if (!invoiceId) {
        return res.status(400).send({
            success: false,
            message: "Invoice ID is required",
        });
    }

    try {
        for (const pro of data) {
            const product = await Product.findOne({ where: { id: pro?.id } });

            if (product) {
                // Ensure valid numbers for quantity calculation
                const currentQty = parseInt(product.qty) || 0;
                const returnQty = parseInt(pro?.qty) || 0;
                const updatedQty = currentQty + returnQty;

                await Product.update({ qty: updatedQty }, { where: { id: product.id } });
            } else {
                console.log(`Product with ID ${pro?.id} not found`);
            }
        }

        // Fetch invoice details
        const InvoiceData = await Invoice.findOne({ where: { id: invoiceId } });
        if (!InvoiceData) {
            return res.status(404).send({
                success: false,
                message: "Invoice not found",
            });
        }

        // Fetch user due details
        const due = await UserDue.findOne({ where: { userId: InvoiceData?.userId } });
        if (due) {
            const updatedDue = Math.max(0, (parseInt(due.amount) || 0) - (parseInt(InvoiceData.paidamount) || 0));
            await UserDue.update({ amount: updatedDue }, { where: { userId: InvoiceData.userId } });
        }

        // Delete invoice and related records
        await Invoice.destroy({ where: { id: invoiceId } });
        await SaleOrder.destroy({ where: { invoice_id: invoiceId } });
        await Notification.destroy({ where: { invoiceId: invoiceId } });

        res.status(200).send({
            success: true,
            message: "Product returned successfully",
        });
    } catch (error) {
        console.error("Error in ReturnSale:", error);
        res.status(500).send({ success: false, message: error.message });
    }
};


exports.ReturnPurchase = async (req, res) => {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).send({
            success: false,
            message: "Invalid or empty product update data",
        });
    }

    try {
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

        res.status(200).send({
            success: true,
            message: "Product returned successfully",
        });
    } catch (error) {
        console.error("Error in ReturnSale:", error);
        res.status(500).send({ success: false, message: error.message });
    }
};

