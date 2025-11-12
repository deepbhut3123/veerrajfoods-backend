require("dotenv").config();
const fs = require("fs"); // You can remove this if not using HTTPS anymore
const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

require("./db/db.js");
// require('./controllers/backend/cronJobs.js');

// Create an Express application
const app = express();

// ✅ Trust proxy to get real client IP when behind reverse proxy
app.set("trust proxy", true);

// Middleware
const allowedOrigins = [
  "https://veerrajfoods-frontend.vercel.app", // ✅ your production frontend
  "http://localhost:3000", // ✅ optional: local dev frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // optional: if you send cookies/auth
  })
);

app.use(express.json());
app.use("/api/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/frontend", userRoutes);
app.use("/api/backend", adminRoutes);
app.use("/api", authRoutes);

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
