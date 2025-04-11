const Sale = require("../models/Sale");
const Tax = require("../models/Tax");
const Expense = require("../models/Expance");
const Salary = require("../models/Salary");
const { getUSDToPKRExchangeRates } = require("../currencyExchangeRates");

const getNetProfit = async (req, res) => {
  try {
    const conversionRate = await getUSDToPKRExchangeRates(); // 1 USD = 280 PKR

    // 1. Total Revenue (in USD directly)
    const sales = await Sale.find();
    const totalRevenueUSD = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // 2. Salaries (PKR → USD)
    const salaries = await Salary.find();
    const totalSalariesPKR = salaries.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSalariesUSD = totalSalariesPKR / conversionRate;

    // 3. Expenses (PKR → USD)
    const expenses = await Expense.find();
    const totalExpensesPKR = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpensesUSD = totalExpensesPKR / conversionRate;

    // 4. Profit Before Tax (USD)
    const profitBeforeTaxUSD = totalRevenueUSD - (totalSalariesUSD + totalExpensesUSD);

    // 5. Tax % (average)
    const taxes = await Tax.find();
    const taxPercentage =
      taxes.reduce((sum, tax) => sum + tax.percentage, 0) / taxes.length || 0;

    // 6. Tax Amount (USD)
    const taxAmountUSD = profitBeforeTaxUSD * (taxPercentage / 100);

    // 7. Net Profit (USD)
    const netProfitUSD = profitBeforeTaxUSD - taxAmountUSD;

    // ✅ Response
    res.status(200).json({
      success: true,
      data: {
        totalRevenueUSD: parseFloat(totalRevenueUSD.toFixed(2)),
        totalSalaries: {
          PKR: parseFloat(totalSalariesPKR.toFixed(2)),
          USD: parseFloat(totalSalariesUSD.toFixed(2)),
        },
        totalExpenses: {
          PKR: parseFloat(totalExpensesPKR.toFixed(2)),
          USD: parseFloat(totalExpensesUSD.toFixed(2)),
        },
        profitBeforeTaxUSD: parseFloat(profitBeforeTaxUSD.toFixed(2)),
        taxPercentage: parseFloat(taxPercentage.toFixed(2)),
        taxAmountUSD: parseFloat(taxAmountUSD.toFixed(2)),
        netProfitUSD: parseFloat(netProfitUSD.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { getNetProfit };
