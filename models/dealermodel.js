const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
});

const dealerSchema = new mongoose.Schema(
  {
    dealerName: { type: String, required: true },
    products: [productSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dealer", dealerSchema);
