const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    desc: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);