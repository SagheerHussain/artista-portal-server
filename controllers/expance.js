const Expance = require("../models/Expance");
const User = require("../models/User");

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expance.find()
      .populate("admin")
      .populate("category");
    res.status(200).json({
      success: true,
      expenses,
      message: "Expances fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Total Expance
const getTotalExpenses = async (req, res) => {
  try {
    const result = await Expance.aggregate([
      {
        $group: {
          _id: null,
          totalExpenseAmount: { $sum: "$amount" }, // Sum of all expense amounts
        },
      },
    ]);

    const totalExpense = result[0]?.totalExpenseAmount || 0;

    res.status(200).json({
      success: true,
      totalExpense,
      message: "Total Expense Amount calculated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get expense by id
const getExpanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expance.findById(id)
      .populate("admin")
      .populate("category");
    if (!expense)
      return res
        .status(404)
        .json({ success: false, message: "Expense record not found" });
    res.status(200).json({
      success: true,
      expense,
      message: "Expense fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { title, amount, date, category, admin } =
      req.body;

    if (
      !title ||
      !amount ||
      !date ||
      !category ||
      !admin
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById({ _id: admin });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = parseInt(date.split("-")[1], 10) - 1;
    const year = parseInt(date.split("-")[0]);

    const newExpance = await Expance.create({
      title,
      amount,
      category,
      date,
      month: months[monthIndex],
      year: year,
      admin: user._id,
    });
    res.status(200).json({
      success: true,
      message: "Expense record created successfully",
      expense: newExpance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = parseInt(date.split("-")[1], 10) - 1;
    const year = parseInt(date.split("-")[0]);

    const updatedExpense = await Expance.findByIdAndUpdate(
      { _id: id },
      { title, amount, category, date, month: months[monthIndex], year },
      { new: true }
    );
    if (!updatedExpense)
      return res
        .status(404)
        .json({ success: false, message: "Expense record not found" });
    res.status(200).json({
      success: true,
      message: "Expense record updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expance.findByIdAndDelete({ _id: id });
    if (!deletedExpense)
      return res
        .status(404)
        .json({ success: false, message: "Expense record not found" });
    res.status(200).json({
      success: true,
      message: "Expense record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Search Expense by employee
const searchExpense = async (req, res) => {
  try {
    const { month, year } = req.query;

    const query = {}; // Start with empty query

    if (month) {
      query.month = { $regex: new RegExp(`^${month}$`, "i") };
    }
    if (year) {
      query.year = Number(year);
    }

    const expenses = await Expance.find(query).populate("admin category");

    res.status(200).json({
      success: true,
      expenses,
      message: "Expenses fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get Monthly Expense
const getMonthlyExpenseData = async (req, res) => {
  try {
    const EXCHANGE_RATE = 280; // Static PKR to USD conversion rate

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentYear = new Date().getFullYear();
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      year: currentYear,
      totalExpenses: 0,
      count: 0,
    }));

    const monthlyExpensesData = await Expance.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          totalExpenses: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $month: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1,
              },
            },
          },
          totalExpenses: 1,
          count: 1,
          year: "$_id.year",
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    const finalData = allMonths.map((month) => {
      const actualData = monthlyExpensesData.find(
        (expense) =>
          expense.month === monthNames.indexOf(month.month) + 1 &&
          expense.year === month.year
      );

      return actualData
        ? {
            month: month.month,
            year: actualData.year,
            totalExpenses: actualData.totalExpenses,
            count: actualData.count,
          }
        : month;
    });

    res.status(200).json({
      success: true,
      data: finalData,
      message: "Monthly expense data fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get Yearly Expense
const getYearlyExpenseData = async (req, res) => {
  try {
    const EXCHANGE_RATE = 280; // Static conversion rate from PKR to USD

    const yearlyExpenseData = await Expance.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
          },
          totalExpenses: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalExpenses: 1,
          count: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    // Convert PKR to USD
    const convertedData = yearlyExpenseData.map((item) => ({
      year: item.year,
      totalExpenses: item.totalExpenses,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: convertedData,
      message: "Yearly expense data fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAllExpenses,
  getTotalExpenses,
  getExpanceById,
  createExpense,
  updateExpense,
  deleteExpense,
  searchExpense,
  getMonthlyExpenseData,
  getYearlyExpenseData,
};
