const express = require("express");
const router = express.Router();
const dealerController = require("../controllers/dealercontroller");
const salesController = require("../controllers/salescontroller")
const onlineOrderController = require("../controllers/onlineOrdercontroller")

router.post("/dealers", dealerController.addDealer);
router.get("/dealers", dealerController.getAllDealers);
router.get("/dealers/:id", dealerController.getSingleDealer)
router.put("/dealers/:id/edit", dealerController.updateDealer)
router.delete("/dealers/:id/delete", dealerController.deleteDealer)

router.post("/sales", salesController.createSale)
router.get("/sales", salesController.getAllSales)
router.delete("/sales/:id/delete", salesController.deleteSales)
router.post("/sales/export", salesController.exportToexcel)

router.post("/online-order", onlineOrderController.addOrderdetail)
router.get("/online-order", onlineOrderController.getOrderdetail)
router.get("/online-order/:id", onlineOrderController.getSingleOrderdetail)
router.put("/online-order/:id/edit", onlineOrderController.updateOrderDetail)
router.delete("/online-order/:id/delete", onlineOrderController.deleteOrderDetail)
router.post("/online-order/export", onlineOrderController.exportToexcel)

module.exports = router;
