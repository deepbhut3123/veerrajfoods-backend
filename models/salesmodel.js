const mongoose = require("mongoose");

const saleProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
    products: [saleProductSchema],
    totalAmount: { type: Number, required: true },
    kata: { type: Number, required: false},
    transport: { type: Number, required: false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);