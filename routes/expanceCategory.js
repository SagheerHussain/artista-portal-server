const express = require("express");
const router = express.Router();

const {
  getExpanceCategories,
  createExpanceCategory,
  updateExpanceCategory,
  deleteExpanceCategory,
} = require("../controllers/expanceCategory");

const { authenticateToken, admin } = require("../middlewares/authorization");

router.post("/", authenticateToken, admin, createExpanceCategory);
router.get("/", authenticateToken, admin, getExpanceCategories);
router.put("/update/:id", authenticateToken, admin, updateExpanceCategory);
router.delete("/delete/:id", authenticateToken, admin, deleteExpanceCategory);

module.exports = router;
