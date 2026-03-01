const mongoose = require("mongoose");
const Sale = require("../models/salesmodel");
const Payment = require("../models/paymentmodel");

exports.getDealerMonthlySummary = async (req, res) => {
  try {
    const { dealerId, year } = req.query;

    if (!dealerId || !year) {
      return res.status(400).json({
        success: false,
        message: "dealerId and year required",
      });
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    /* ================= SALES ================= */
    const sales = await Sale.aggregate([
      {
        $match: {
          dealer: new mongoose.Types.ObjectId(dealerId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalSales: {
            $sum: {
              $round: ["$totalAmount", 0], // ✅ round & remove points
            },
          },
        },
      },
    ]);

    /* ================= PAYMENTS ================= */
    const payments = await Payment.aggregate([
      {
        $match: {
          dealerId: new mongoose.Types.ObjectId(dealerId),
        },
      },

      // ✅ Convert string to Date
      {
        $addFields: {
          orderDateObj: {
            $dateFromString: {
              dateString: "$orderDate",
              format: "%Y-%m-%d", // adjust format if needed
            },
          },
        },
      },

      // ✅ Date filtering AFTER conversion
      {
        $match: {
          orderDateObj: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },

      // ✅ Group monthwise
      {
        $group: {
          _id: { $month: "$orderDateObj" },
          totalPayment: {
            $sum: { $toDouble: "$totalAmount" }, // string → number
          },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    /* ================= MERGE DATA ================= */

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      sales: 0,
      payment: 0,
    }));

    sales.forEach((s) => {
      months[s._id - 1].sales = s.totalSales;
    });

    payments.forEach((p) => {
      months[p._id - 1].payment = p.totalPayment;
    });

    res.status(200).json({
      success: true,
      data: months,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
