// dependencies
const express = require("express");
const connectDB = require("./config/config");
const app = express();
const cors = require("cors");
require("dotenv").config();

// mongo db connection
connectDB();

const allowedOrigins = [
  "http://localhost:5173", // Localhost (development)
  "https://artista-seven.vercel.app", // Vercel domain (production)
  "https://artista.skynetsilicon.com",
];

// port
const PORT = process.env.PORT || 3000;

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman) or if origin is in allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const paymentMethodRoutes = require("./routes/paymentMethod");
const expenceRoutes = require("./routes/expance");
const expanceCategoryRoutes = require("./routes/expanceCategory");
const salaryRoutes = require("./routes/salary");
const salesRoutes = require("./routes/sale");

// routes
app.get("/", (req, res) => res.send("Artista API"));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment-method", paymentMethodRoutes);
app.use("/api/expences", expenceRoutes);
app.use("/api/expance-category", expanceCategoryRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/sales", salesRoutes);

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
