const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderDate: { type: String, required: true },
    dealerName: { type: String, required: true },
    totalAmount: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);