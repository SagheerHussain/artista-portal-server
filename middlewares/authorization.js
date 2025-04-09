const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_KEY || "your_secret_key";

// ✅ Middleware to Authenticate JWT Token
const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Admin Middleware
const admin = async (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Access denied. You are not an admin." });
  }
};

module.exports = { authenticateToken, admin };
