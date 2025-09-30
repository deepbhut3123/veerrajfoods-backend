const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables from .env file

const mongoURI = process.env.MONGODB_URL; // Access MongoDB URL from environment variable

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});
