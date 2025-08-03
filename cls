[1mdiff --git a/controllers/dailysalse.controller.js b/controllers/dailysalse.controller.js[m
[1mindex 3a04007..b72ca8e 100644[m
[1m--- a/controllers/dailysalse.controller.js[m
[1m+++ b/controllers/dailysalse.controller.js[m
[36m@@ -43,7 +43,8 @@[m [mexports.getOrder = async (req, res) => {[m
             limit: 10,[m
             where: {[m
                 invoice_id: req.params.id,[m
[31m-                compId: req?.compId[m
[32m+[m[32m                compId: req?.compId,[m
[32m+[m[32m                active:true[m
             },[m
             include: [[m
                 {[m
[36m@@ -80,11 +81,13 @@[m [mexports.getOrder = async (req, res) => {[m
         let userData = {[m
             ...user?.toJSON(),[m
             state: state?.name,[m
[32m+[m[32m            address: user?.address,[m
             packing: invo?.packing,[m
             delivery: invo?.delivery,[m
             lastdiscount: invo?.lastdiscount,[m
             previousdue: invo?.previousdue,[m
             paidamount: invo?.paidamount,[m
[32m+[m[32m            type: invo?.type,[m
             date: invo?.date[m
         };[m
 [m
[36m@@ -94,6 +97,7 @@[m [mexports.getOrder = async (req, res) => {[m
             success: true,[m
             items: data,[m
             user: userData,[m
[32m+[m[32m            invoice: invo[m
         })[m
 [m
     } catch (error) {[m
