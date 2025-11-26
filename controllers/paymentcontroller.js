const Payment = require("../models/paymentmodel"); // adjust path if needed
const Dealer = require("../models/dealermodel");
const ExcelJS = require("exceljs");

const payment = {
  // ✅ Add new order
  addPaymentdetail: async (req, res) => {
    try {
      const { dealerId, totalAmount } = req.body;

      // Validate dealer exists
      const dealer = await Dealer.findById(dealerId);
      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: "Dealer not found",
        });
      }

      // ➖ SUBTRACT payment from dealer.amount
      dealer.amount = (dealer.amount || 0) - totalAmount;
      await dealer.save();

      // Create payment entry
      const newPayment = new Payment(req.body);
      await newPayment.save();

      res.status(201).json({
        success: true,
        message: "Payment added successfully",
        data: newPayment,
      });
    } catch (error) {
      res.status(400).json({
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

      // build match stage
      const match = {};

      // date range (only if provided)
      if (startDate && endDate) {
        match.orderDate = { $gte: startDate, $lte: endDate };
      }

      // if search provided, we will build an $or that checks:
      //  - dealer.dealerName (from lookup)
      //  - totalAmount (stringified using $toString + regexMatch)
      let searchMatch = null;
      if (search) {
        // safe-escape regex special chars in search (optional)
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        searchMatch = {
          $or: [
            { "dealer.dealerName": { $regex: escaped, $options: "i" } },
            // use $expr + $regexMatch to match numeric/strings by stringifying totalAmount
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$totalAmount" },
                  regex: escaped,
                  options: "i",
                },
              },
            },
          ],
        };
      }

      // build pipeline
      const pipeline = [
        // initial filter by date if any
        { $match: match },
        // lookup dealer document
        {
          $lookup: {
            from: "dealers", // verify your dealers collection name
            localField: "dealerId",
            foreignField: "_id",
            as: "dealer",
          },
        },
        // unwind dealer array (if some payments might not have dealer, you can keep empty with preserveNullAndEmptyArrays: true)
        { $unwind: { path: "$dealer", preserveNullAndEmptyArrays: true } },
      ];

      // apply search-based match if provided
      if (searchMatch) pipeline.push({ $match: searchMatch });

      // sort (desc by orderDate)
      pipeline.push({ $sort: { orderDate: -1 } });

      // Optional: project/format output the same way as populate would
      pipeline.push({
        $project: {
          _id: 1,
          orderDate: 1,
          totalAmount: 1,
          paymentMode: 1,
          createdAt: 1,
          updatedAt: 1,
          dealerId: {
            _id: "$dealer._id",
            dealerName: "$dealer.dealerName",
          },
        },
      });

      const payments = await Payment.aggregate(pipeline);

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
      const payment = await Payment.findById(req.params.id).populate(
        "dealerId",
        "dealerName"
      );
      if (!payment)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res.status(500).json({
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
      res.status(500).json({
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
        { header: "Payment Mode", key: "paymentMode", width: 25},
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
