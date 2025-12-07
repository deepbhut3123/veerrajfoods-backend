const Customer = require("../models/customerModel");
const Invoice = require("../models/invoiceModel");

const customerController = {
  // POST /backend/customers
  addCustomer: async (req, res) => {
    try {
      const { name, mobile, address } = req.body;

      if (!name || !mobile) {
        return res.status(400).json({
          success: false,
          message: "Name and mobile are required",
        });
      }

      const existing = await Customer.findOne({ mobile });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Customer with this mobile already exists",
        });
      }

      const customer = await Customer.create({ name, mobile, address });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error creating customer",
        error: err.message,
      });
    }
  },

  // GET /backend/customers?search=...
  getCustomers: async (req, res) => {
    try {
      const { search } = req.query;

      const match = {};
      if (search) {
        match.$or = [
          { name: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ];
      }

      // get customers with invoiceCount
      const customers = await Customer.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "invoices",
            localField: "_id",
            foreignField: "customerId",
            as: "invoices",
          },
        },
        {
          $addFields: {
            invoiceCount: { $size: "$invoices" },
          },
        },
        {
          $project: {
            name: 1,
            mobile: 1,
            address: 1,
            invoiceCount: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error fetching customers",
        error: err.message,
      });
    }
  },
};

module.exports = customerController;
