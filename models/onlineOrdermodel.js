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
    weight: { type: String, required: false },
    courier: { type: String, required: false },
    trackingNumber: { type: String, required: false },
    orderSource: { type: String, required: false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnlineOrder", orderSchema);