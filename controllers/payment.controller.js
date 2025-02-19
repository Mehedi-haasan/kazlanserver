const db = require("../models");
const SSLCommerzPayment = require('sslcommerz-lts')
const ProductVariant = db.productVariant;
const ProductAttribute = db.ProductAttribute;
const SaleOrderLine = db.saleorderlines;
const SaleOrder = db.saleorder;
const State = db.state;

const store_id = 'qubic66e072f1d9e9d'
const store_passwd = 'qubic66e072f1d9e9d@ssl'
const is_live = false


const PlaceOrder = async (data) => {

    let OrderData = [];

    const state = await State.findOne({
        attributes: ['id', 'name', 'charge'],
        where: {
            id: data.state
        }
    });

    let cartData = await SaleOrderLine.findAll({
        where: {
            userId: data.userId
        },
        include: [
            {
                model: ProductVariant,
                attributes: ['id', 'name', 'image_url', 'price', 'standard_price', 'template_id'],
                include: [
                    {
                        model: ProductAttribute,
                        attributes: ['name', 'value'],
                    },
                ],
            },
        ],
    })


    cartData.forEach(item => {
        OrderData.push({
            product_id: item.product_product.id,
            template_id: item.product_product.template_id,
            price: item.product_product.price,
            userId: data.userId,
            name: data.name,
            state: state.name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            charge: state.charge,
            qty: item.qty,
            tran_id: data?.tran_id,
            coupon: data.coupon,
            note: data.note,
            status: "Draft",
            paymentstatus:'Done'
        });
    });



    if (data?.paramsId !== '0') {
        let buyNowData = await ProductVariant.findOne({
            where: {
                id: data.paramsId,
            },
            attributes: ['id', 'name', 'image_url', 'price', 'standard_price', 'description', 'category_id', 'template_id'],
            include: [
                {
                    model: ProductAttribute,
                    attributes: ['name', 'value'],
                },
            ],

        })

        OrderData.push({
            product_id: buyNowData?.id,
            template_id: buyNowData?.template_id,
            price: buyNowData?.price,
            userId: data?.userId,
            name: data?.name,
            state: state?.name,
            address: data?.address,
            phone: data?.phone,
            email: data?.email,
            charge: state?.charge,
            qty: data?.qty,
            tran_id: data?.tran_id,
            coupon: data?.coupon,
            note: data?.note,
            status: "Draft",
            paymentstatus:'Done'
        });
    }


    return OrderData

};

exports.CreatePayment = async (req, res) => {
    try {
        let total = 0;
        let userData = req.body;
        userData.userId = req.userId;
        userData.tran_id = Date.now();

        const orderItem = await PlaceOrder(userData)

        orderItem.forEach((item) => {
            total = total + parseInt(item.qty) * parseInt(item.price)
        })

        const data = {
            total_amount: total,
            currency: 'BDT',
            tran_id: userData.tran_id,
            success_url: `http://localhost:8050/api/payment/success/${userData.tran_id}/${req.userId}`,
            fail_url: 'http://localhost:8050/api/payment/failed',
            cancel_url: 'http://localhost:8050/api/payment/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: userData.name,
            cus_email: userData.email,
            cus_add1: userData.address,
            cus_add2: 'Dhaka',
            cus_city: userData.state,
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: userData.phone,
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };



        await SaleOrder.bulkCreate(orderItem);
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
            let GatewayPageURL = apiResponse.GatewayPageURL
            res.status(200).send({ url: GatewayPageURL })
        });


    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.PaymentSuccess = async (req, res) => {
    try {
        const { tran_id, userId } = req.params;
        await SaleOrder.update(
            { paymentstatus: 'Done' },
            { where: { tran_id } }
        );

        await SaleOrderLine.destroy({
            where: {
                userId: userId
            }
        })

        res.redirect(`http://localhost:3000/success/${tran_id}`);
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.PaymentFailed = async (req, res) => {
    res.redirect('http://localhost:3000/failed')
}

exports.PaymentCancel = async (req, res) => {
    res.redirect('http://localhost:3000/cancel')
}


exports.PaymentValidate = async (req, res) => {
    const data = {
        val_id: ADGAHHGDAKJ456454 //that you go from sslcommerz response
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.validate(data).then(data => {
        //process the response that got from sslcommerz 
        // https://developer.sslcommerz.com/doc/v4/#order-validation-api
    });
}

exports.PaymentInitiateRefund = async (req, res) => {
    const data = {
        refund_amount: 10,
        refund_remarks: '',
        bank_tran_id: CB5464321445456456,
        refe_id: EASY5645415455,
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.initiateRefund(data).then(data => {
        //process the response that got from sslcommerz 
        //https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
    });
}

exports.PaymentRefundQuery = async (req, res) => {
    const data = {
        refund_ref_id: SL4561445410,
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.refundQuery(data).then(data => {
        //process the response that got from sslcommerz
        //https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
    });
}

exports.PaymentTransactionQueryByTransactionId = async (req, res) => {
    const data = {
        tran_id: AKHLAKJS5456454,
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.transactionQueryByTransactionId(data).then(data => {
        //process the response that got from sslcommerz
        //https://developer.sslcommerz.com/doc/v4/#by-session-id
    });
}

exports.PaymentTransactionQueryBySessionId = async (req, res) => {
    const data = {
        sessionkey: AKHLAKJS5456454,
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.transactionQueryBySessionId(data).then(data => {
        //process the response that got from sslcommerz
        //https://developer.sslcommerz.com/doc/v4/#by-session-id
    });
}