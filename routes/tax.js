const express = require("express");

const router = express.Router();
const { getTaxes, getTaxById, createTax, updateTax, deleteTax, getTaxSummary } = require("../controllers/tax");

const { authenticateToken, admin } = require("../middlewares/authorization");

router.post("/", authenticateToken, admin, createTax);

router.get("/", authenticateToken, admin,  getTaxes);

router.get("/:id", authenticateToken, admin, getTaxById);

router.get("/analytics/summary", authenticateToken, admin, getTaxSummary);

router.put("/update/:id", authenticateToken, admin, updateTax);

router.delete("/delete/:id", authenticateToken, admin, deleteTax);

module.exports = router;
