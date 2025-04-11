const express = require("express");

const { getNetProfit } = require("../controllers/profit");

const { authenticateToken, admin } = require("../middlewares/authorization");

const router = express.Router();

router.get("/", authenticateToken, admin, getNetProfit);

module.exports = router;
