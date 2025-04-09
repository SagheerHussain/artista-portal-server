const Salary = require("../models/Salary");
const User = require("../models/User");

// Get all salaries
const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate("employee");
    res.status(200).json({
      success: true,
      salaries,
      message: "Salaries fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get salary by id
const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById({ _id: req.params.id }).populate(
      "employee"
    );
    if (!salary)
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    res.status(200).json({
      success: true,
      salary,
      message: "Salary fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Create new salary
const createSalary = async (req, res) => {
  try {
    const {
      employee,
      amount,
      bonus,
      status,
      paidDate,
      totalAmount,
      admin
    } = req.body;

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

    const monthIndex = parseInt(paidDate.split("-")[1], 10) - 1;
    const year = parseInt(paidDate.split("-")[0]);

    if (
      !employee ||
      !amount ||
      !status ||
      !paidDate ||
      !totalAmount ||
      !admin 
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById({ _id: employee });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const newSalary = await Salary.create({
      employee: user._id,
      amount: Number(amount),
      bonus: Number(bonus) || 0,
      status,
      paidDate,
      month: months[monthIndex],
      year: year,
      totalAmount: Number(totalAmount),
      admin: admin,
    });
    res.status(200).json({
      success: true,
      message: "Salary record created successfully",
      salary: newSalary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Update salary
const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee, amount, bonus, status, paidDate, totalAmount } = req.body;

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

    const monthIndex = parseInt(paidDate.split("-")[1], 10) - 1;
    const year = parseInt(paidDate.split("-")[0]);

    const updatedSalary = await Salary.findByIdAndUpdate(
      { _id: id },
      {
        employee,
        amount: Number(amount),
        bonus: Number(bonus) || 0,
        status,
        paidDate,
        month: months[monthIndex],
        year,
        totalAmount: Number(totalAmount),
      },
      { new: true }
    );
    if (!updatedSalary)
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });

    res.status(200).json({
      success: true,
      message: "Salary record updated successfully",
      salary: updatedSalary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
   
// Delete salary
const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSalary = await Salary.findByIdAndDelete({ _id: id });
    if (!deletedSalary)
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    res.status(200).json({
      success: true,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Search salaries by employee
const searchSalariesByEmployee = async (req, res) => {
  try {
    const { month, year, status, employeeId } = req.query;

    const query = {}; // Start with empty query

    if (employeeId) {
      query.employee = employeeId;
    }
    if (month) {
      query.month = { $regex: new RegExp(`^${month}$`, "i") };
    }
    if (year) {
      query.year = Number(year);
    }
    if (status) {
      query.status = status;
    }

    const salaries = await Salary.find(query).populate("employee");

    res.status(200).json({
      success: true,
      salaries,
      message: "Salaries fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getMonthlySalariesData = async (req, res) => {
  try {
    // Array of month names
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

    // Get all months from the current year
    const currentYear = new Date().getFullYear();
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      year: currentYear,
      totalSalaries: 0,
      count: 0,
    }));

    // Get actual salaries data
    const monthlySalariesData = await Salary.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$paidDate" },
            year: { $year: "$paidDate" },
          },
          totalSalaries: { $sum: "$totalAmount" },
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
          totalSalaries: 1,
          count: 1,
          year: "$_id.year",
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    // Merge actual data with all months
    const finalData = allMonths.map((month) => {
      const actualData = monthlySalariesData.find(
        (salary) =>
          salary.month === monthNames.indexOf(month.month) + 1 &&
          salary.year === month.year
      );

      return actualData
        ? {
            month: month.month,
            year: actualData.year,
            totalSalaries: actualData.totalSalaries,
            count: actualData.count,
          }
        : month;
    });

    res.status(200).json({
      success: true,
      data: finalData,
      message: "Monthly salaries data fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getYearlySalariesData = async (req, res) => {
  try {
    const yearlySalariesData = await Salary.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$paidDate" },
          },
          totalSalaries: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalSalaries: 1,
          count: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    // Convert USD To PKR
    const convertedData = yearlySalariesData.map((item) => ({
      year: item.year,
      totalSalaries: item.totalSalaries,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: convertedData,
      message: "Yearly salaries data fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAllSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
  searchSalariesByEmployee,
  getMonthlySalariesData,
  getYearlySalariesData,
};
