const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderDate: { type: String, required: true },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
    totalAmount: { type: String, required: true },
    paymentMode: { type: String, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
