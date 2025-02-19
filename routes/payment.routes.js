const jwt = require('../middleware/authentication');
const controller = require('../controllers/payment.controller')
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })


    app.post('/api/create/payment', jwt.verifyToken, controller.CreatePayment);
    app.post('/api/payment/success/:tran_id/:userId', controller.PaymentSuccess);
    app.post('/api/payment/failed', controller.PaymentFailed);
    app.post('/api/payment/cancel', controller.PaymentCancel);
    app.get('/validate', controller.PaymentValidate)
    app.get('/initiate-refund',controller.PaymentInitiateRefund)
    app.get('/refund-query',controller.PaymentRefundQuery)
    app.get('/transaction-query-by-transaction-id',controller.PaymentTransactionQueryByTransactionId)
    app.get('/transaction-query-by-session-id',controller.PaymentTransactionQueryBySessionId)
}