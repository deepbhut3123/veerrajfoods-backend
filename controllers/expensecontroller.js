const Expense = require("../models/expensemodel"); // adjust path if needed
const ExcelJS = require("exceljs");

const expense = {
  // ✅ Add new order
  addExpense: async (req, res) => {
    try {
      const newExpence = new Expense(req.body);
      await newExpence.save();
      res
        .status(201)
        .json({
          success: true,
          message: "Expense created successfully",
          data: newExpence,
        });
    } catch (error) {
      res
        .status(400)
        .json({
          success: false,
          message: "Error creating expense",
          error: error.message,
        });
    }
  },

  // ✅ Get all orders
  getExpenses: async (req, res) => {
    try {
      const { search, startDate, endDate } = req.query;

      let query = {};

      // ✅ Search filter
      if (search) {
        query.$or = [
          { desc: { $regex: search, $options: "i" } },
          { amount: { $regex: search, $options: "i" } },
        ];
      }

      // ✅ Only apply date filter if user selected a range
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }

      const expenses = await Expense.find(query).sort({ orderDate: -1 });

      res.status(200).json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    }
  },

  // ✅ Get single order by ID
  getSingleExpense: async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);
      if (!expense)
        return res
          .status(404)
          .json({ success: false, message: "Expense not found" });
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching expense",
          error: error.message,
        });
    }
  },

  updateExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
        new: true, // return updated doc
        runValidators: true, // validate before saving
      });

      if (!updatedExpense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data: updatedExpense,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating expense",
        error: error.message,
      });
    }
  },

  // ✅ Delete order by ID
  deleteExpense: async (req, res) => {
    try {
      const expense = await Expense.findByIdAndDelete(req.params.id);
      if (!expense)
        return res
          .status(404)
          .json({ success: false, message: "Expense not found" });
      res
        .status(200)
        .json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error deleting expense",
          error: error.message,
        });
    }
  },

  // exportToexcel: async (req, res) => {
  //   try {
  //     const { payload: orders } = req.body;
  //     if (!orders || orders.length === 0) {
  //       return res.status(400).json({ message: "No orders provided" });
  //     }

  //     const workbook = new ExcelJS.Workbook();
  //     const worksheet = workbook.addWorksheet("Orders");

  //     worksheet.columns = [
  //       { header: "Order Date", key: "orderDate", width: 15 },
  //       { header: "Customer Name", key: "customerName", width: 25 },
  //       { header: "Phone No", key: "phoneNo", width: 15 },
  //       { header: "Area", key: "area", width: 20 },
  //       { header: "Courier", key: "courier", width: 20 },
  //       { header: "Tracking No", key: "trackingNumber", width: 25 },
  //       { header: "Total Amount", key: "totalAmount", width: 15 },
  //       { header: "Order Source", key: "orderSource", width: 15 },
  //     ];

  //     orders.forEach((order) => {
  //       worksheet.addRow(order);
  //     });

  //     res.setHeader(
  //       "Content-Type",
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     );
  //     res.setHeader(
  //       "Content-Disposition",
  //       "attachment; filename=Orders.xlsx"
  //     );

  //     await workbook.xlsx.write(res);
  //     res.end();
  //   } catch (error) {
  //     console.error("Excel export error:", error);
  //     res.status(500).json({ message: "Failed to export orders" });
  //   }
  // }
};

module.exports = expense;
