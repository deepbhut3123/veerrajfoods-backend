const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobileNo: String,
  // other fields
}, { timestamps: true });

// ✅ Prevent model overwrite error
const User = mongoose.models.Users || mongoose.model("Users", userSchema);

module.exports = User;
