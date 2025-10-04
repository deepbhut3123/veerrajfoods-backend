const Payment = require("../models/paymentmodel"); // adjust path if needed
const ExcelJS = require("exceljs");

const payment = {
  // ✅ Add new order
  addPaymentdetail: async (req, res) => {
    try {
      const newPayment = new Payment(req.body);
      await newPayment.save();
      res
        .status(201)
        .json({
          success: true,
          message: "Payment added successfully",
          data: newPayment,
        });
    } catch (error) {
      res
        .status(400)
        .json({
          success: false,
          message: "Error creating payment",
          error: error.message,
        });
    }
  },

  // ✅ Get all orders
  getPaymentdetail: async (req, res) => {
    try {
      const { search, startDate, endDate } = req.query;

      let query = {};

      // ✅ Search filter
      if (search) {
        query.$or = [
          { dealerName: { $regex: search, $options: "i" } },
          { totalAmount: { $regex: search, $options: "i" } },
        ];
      }

      // ✅ Only apply date filter if user selected a range
      if (startDate && endDate) {
        query.orderDate = { $gte: startDate, $lte: endDate };
      }

      const payments = await Payment.find(query).sort({ orderDate: -1 });

      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching payments",
        error: error.message,
      });
    }
  },

  // ✅ Get single order by ID
  getSinglePaymentdetail: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching payment",
          error: error.message,
        });
    }
  },

  updatePaymentDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
        new: true, // return updated doc
        runValidators: true, // validate before saving
      });

      if (!updatedPayment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: updatedPayment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating payment",
        error: error.message,
      });
    }
  },

  // ✅ Delete order by ID
  deletePaymentDetail: async (req, res) => {
    try {
      const payment = await Payment.findByIdAndDelete(req.params.id);
      if (!payment)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      res
        .status(200)
        .json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error deleting payment",
          error: error.message,
        });
    }
  },

  exportToexcel: async (req, res) => {
    try {
      const { payload: payments } = req.body;
      if (!payments || payments.length === 0) {
        return res.status(400).json({ message: "No payments provided" });
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Payments");

      worksheet.columns = [
        { header: "Order Date", key: "orderDate", width: 15 },
        { header: "Dealer Name", key: "dealerName", width: 25 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
      ];

      payments.forEach((payments) => {
        worksheet.addRow(payments);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=Orders.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Excel export error:", error);
      res.status(500).json({ message: "Failed to export payments" });
    }
  },
};

module.exports = payment;
