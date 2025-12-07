const Invoice = require("../models/invoiceModel");
const Customer = require("../models/customerModel");

const invoiceController = {
  // POST /backend/customers/:customerId/invoices
  addInvoiceForCustomer: async (req, res) => {
    try {
      const { customerId } = req.params;
      const {
        invoiceNumber,
        invoiceDate,
        products,
        courierName,
        courierCharge,
      } = req.body;

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      if (!invoiceNumber || !invoiceDate || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invoice number, date and at least one product are required",
        });
      }

      const safeProducts = products.map((p) => {
        const price = Number(p.price || 0);
        const qty = Number(p.qty || 0);
        const total = price * qty;
        return {
          productName: p.productName,
          price,
          qty,
          total,
        };
      });

      const productsTotal = safeProducts.reduce((sum, p) => sum + p.total, 0);
      const courier = Number(courierCharge || 0);
      const totalAmount = productsTotal;

      const invoice = await Invoice.create({
        customerId,
        invoiceNumber,
        invoiceDate,
        products: safeProducts,
        courierName,
        courierCharge: courier,
        totalAmount,
      });

      return res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error creating invoice",
        error: err.message,
      });
    }
  },

  // GET /backend/customers/:customerId/invoices
  getInvoicesByCustomer: async (req, res) => {
    try {
      const { customerId } = req.params;

      const invoices = await Invoice.find({ customerId }).sort({
        invoiceDate: -1,
      });

      return res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error fetching invoices",
        error: err.message,
      });
    }
  },
};

module.exports = invoiceController;
