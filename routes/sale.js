const express = require("express");

const { authenticateToken, admin } = require("../middlewares/authorization");

const {
  getSales,
  getRevenue,
  getTotalReceivedAmount,
  getUniqueClients,
  getPendingAmount,
  getSaleById,
  getSalesByEmployeeId,
  getEmployeeCurrentSalesAmount,
  getRecieveAmountByEmployee,
  getPendingAmountByEmployee,
  getClientsByEmployee,
  createSale,
  updateSale,
  deleteSale,
  getFilteredSalesByEmployee,
  getFilteredSales,
  getMonthlySalesData,
  getYearlySalesData,
} = require("../controllers/sale");

const router = express.Router();

router.post("/", authenticateToken, createSale);

router.get("/", authenticateToken, admin, getSales);
router.get("/revenue", authenticateToken,  getRevenue);
router.get("/total-received-amount", authenticateToken,  getTotalReceivedAmount);
router.get("/pending-amount", authenticateToken,  getPendingAmount);
router.get("/unique-clients", authenticateToken,  getUniqueClients);
router.get("/sale/:id", authenticateToken,  getSaleById);

router.get("/employee/:employeeId", authenticateToken, getSalesByEmployeeId);
router.get("/employee/total-received-amount/:employeeId", authenticateToken, getRecieveAmountByEmployee);
router.get("/employee/pending-amount/:employeeId", authenticateToken, getPendingAmountByEmployee);
router.get("/employee/unique-clients/:employeeId", authenticateToken, getClientsByEmployee);
router.get("/employee/current/sales-amount/:employeeId", authenticateToken, getEmployeeCurrentSalesAmount);
router.get("/filtered-records/sales", authenticateToken, admin, getFilteredSales);
router.get("/employee/filtered-records/sales/:employeeId", authenticateToken, getFilteredSalesByEmployee);

router.put("/update/:id", authenticateToken, updateSale);
router.delete("/delete/:id", authenticateToken,  deleteSale);

router.get("/monthly-sales-data", getMonthlySalesData);
router.get("/yearly-sales-data", getYearlySalesData);

module.exports = router;
