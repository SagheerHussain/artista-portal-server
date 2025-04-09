const express = require('express');
const router = express.Router();

const { getAllSalaries, getSalaryById, createSalary, updateSalary, deleteSalary, searchSalariesByEmployee, getYearlySalariesData, getMonthlySalariesData } = require('../controllers/salary');

const { authenticateToken, admin } = require('../middlewares/authorization');

router.get('/', getAllSalaries);
router.get('/salary/:id', authenticateToken, getSalaryById);
router.get('/search-employee', authenticateToken, searchSalariesByEmployee);
router.post("/", authenticateToken, createSalary);
router.put('/update/:id', authenticateToken, updateSalary);
router.delete('/delete/:id', authenticateToken, admin, deleteSalary);
router.get('/monthly-salaries', getMonthlySalariesData);
router.get('/yearly-salaries', getYearlySalariesData);

module.exports = router;
