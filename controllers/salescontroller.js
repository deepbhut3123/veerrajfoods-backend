const Sale = require("../models/salesmodel");
const Dealer = require("../models/dealermodel");
const ExcelJS = require("exceljs");

// Create new sale
const salesController = {
  createSale: async (req, res) => {
    try {
      const { date, dealerId, products, totalAmount } = req.body;

      // Validate dealer exists
      const dealer = await Dealer.findById(dealerId);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }

      // Create sale
      const sale = new Sale({
        date,
        dealer: dealerId,
        products,
        totalAmount,
      });

      await sale.save();

      // ➕ ADD sale amount to dealer.amount
      dealer.amount = (dealer.amount || 0) + totalAmount;
      await dealer.save();

      // Populate dealer name
      const savedSale = await Sale.findById(sale._id).populate(
        "dealer",
        "dealerName"
      );

      res.status(201).json({
        message: "Sale created successfully",
        sale: savedSale,
      });
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get all sales
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.find()
        .populate("dealer", "dealerName")
        .sort({ date: -1 });

      res.status(200).json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get single sale by ID
  getSingleSale: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id).populate(
        "dealer",
        "dealerName"
      );
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(200).json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Update sale
  updateSale: async (req, res) => {
    try {
      const { date, dealerId, products, totalAmount } = req.body;

      // Check dealer exists if dealerId is provided
      if (dealerId) {
        const dealer = await Dealer.findById(dealerId);
        if (!dealer) {
          return res.status(404).json({ message: "Dealer not found" });
        }
      }

      const updatedSale = await Sale.findByIdAndUpdate(
        req.params.id,
        {
          date,
          dealer: dealerId,
          products,
          totalAmount,
        },
        { new: true }
      ).populate("dealer", "dealerName");

      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }

      res.status(200).json({
        message: "Sale updated successfully",
        sale: updatedSale,
      });
    } catch (error) {
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  deleteSales: async (req, res) => {
    try {
      const deletedSales = await Sale.findByIdAndDelete(req.params.id);
      if (!deletedSales)
        return res.status(404).json({ message: "Item not found" });
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  exportToexcel: async (req, res) => {
    try {
      const { payload: sales } = req.body;
      if (!sales || sales.length === 0) {
        return res.status(400).json({ message: "No sales provided" });
      }

      // Make sure dealer names are there (populate if IDs are sent)
      const salesWithDealer = await Sale.find({
        _id: { $in: sales.map((s) => s.key || s._id) },
      }).populate("dealer", "dealerName");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales");

      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Dealer Name", key: "dealerName", width: 25 },
        { header: "Product Name", key: "productName", width: 25 },
        { header: "Price", key: "productPrice", width: 15 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Product Total", key: "total", width: 18 },
        { header: "Sale Total", key: "saleTotal", width: 18 },
      ];

      salesWithDealer.forEach((sale) => {
        const products = sale.products || [];
        products.forEach((product, index) => {
          worksheet.addRow({
            date: index === 0 ? sale.date.toISOString().split("T")[0] : "",
            dealerName: index === 0 ? sale.dealer?.dealerName || "Unknown" : "",
            productName: product.productName,
            productPrice: product.productPrice,
            quantity: product.quantity,
            total: product.total,
            saleTotal: index === 0 ? sale.totalAmount : "",
          });
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=Sales.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Excel export error:", error);
      res.status(500).json({ message: "Failed to export sales" });
    }
  },
};

module.exports = salesController;
