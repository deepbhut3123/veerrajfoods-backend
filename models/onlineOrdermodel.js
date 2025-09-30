const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderDate: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNo: { type: String, required: true },
    area: { type: String, required: true },
    products: [productSchema],
    totalAmount: { type: Number, required: true },
    weight: { type: String, required: true },
    courier: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    orderSource: { type: String, required: true}
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnlineOrder", orderSchema);