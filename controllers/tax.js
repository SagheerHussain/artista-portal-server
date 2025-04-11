const Tax = require("../models/Tax");

const getTaxes = async (req, res) => {
  try {
    const taxes = await Tax.find();
    res.status(200).json({
      success: true,
      taxes,
      message: "Taxes fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch taxes",
      error: error.message,
    });
  }
};

const getTaxById = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await Tax.findById({ _id: id });
    if (!tax)
      return res
        .status(404)
        .json({ success: false, message: "Tax record not found" });
    res.status(200).json({
      success: true,
      tax,
      message: "Tax fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const createTax = async (req, res) => {
  try {
    const { percentage, date } = req.body;

    if (!percentage || !date) {
      return res.status(400).json({
        success: false,
        message: "Percentage and date are required",
      });
    }

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = parseInt(date.split("-")[1], 10) - 1;
    const year = parseInt(date.split("-")[0]);
    const monthName = months[monthIndex];

    // ✅ Check for duplicate entry
    const existingTax = await Tax.findOne({ month: monthName, year });
    if (existingTax) {
      return res.status(200).json({
        success: false,
        message: `Tax for ${monthName} ${year} already exists.`,
      });
    }

    const newTax = await Tax.create({
      percentage,
      date,
      month: monthName,
      year,
    });

    res.status(200).json({
      success: true,
      message: "Tax record created successfully",
      tax: newTax,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage, date } = req.body;
    if (!percentage || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Percentage and date are required" });
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

    const tax = await Tax.findByIdAndUpdate(
      id,
      { percentage, date, month: months[monthIndex], year },
      { new: true }
    );
    res.status(200).json({
      success: true,
      tax,
      message: "Tax updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteTax = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTax = await Tax.findByIdAndDelete({ _id: id });
    if (!deletedTax)
      return res
        .status(404)
        .json({ success: false, message: "Tax record not found" });
    res.status(200).json({
      success: true,
      message: "Tax record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getTaxSummary = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const allTaxes = await Tax.find().sort({ date: 1 });

    let currentMonthTotal = 0;
    const currentYearMonthly = {};
    const overallMonthly = [];
    const yearlyBuckets = {}; // {2024: [...], 2025: [...]}

    allTaxes.forEach((tax) => {
      const dateObj = new Date(tax.date);
      const monthIndex = dateObj.getMonth();
      const monthName = months[monthIndex];
      const year = dateObj.getFullYear();

      // Collect for yearly buckets
      if (!yearlyBuckets[year]) yearlyBuckets[year] = [];
      yearlyBuckets[year].push(tax.percentage);

      // Current Month Total
      if (monthIndex === currentMonthIndex && year === currentYear) {
        currentMonthTotal += tax.percentage;
      }

      // Current Year Monthly Breakdown
      if (year === currentYear) {
        if (!currentYearMonthly[monthName]) {
          currentYearMonthly[monthName] = 0;
        }
        currentYearMonthly[monthName] += tax.percentage;
      }

      // Overall Record
      const key = `${monthName} ${year}`;
      const existing = overallMonthly.find((m) => m.label === key);
      if (existing) {
        existing.totalPercentage += tax.percentage;
      } else {
        overallMonthly.push({
          label: key,
          month: monthName,
          year,
          totalPercentage: tax.percentage,
        });
      }
    });

    // Current Year Average
    const currentYearAverage =
      Object.values(currentYearMonthly).reduce((a, b) => a + b, 0) /
        Object.values(currentYearMonthly).length || 0;

    // Overall Average
    const overallAverage =
      overallMonthly.reduce((sum, rec) => sum + rec.totalPercentage, 0) /
        overallMonthly.length || 0;

    // Yearly Average List
    const yearlyAverageTax = Object.entries(yearlyBuckets).map(
      ([year, values]) => {
        const avg =
          values.reduce((sum, v) => sum + v, 0) / values.length || 0;
        return {
          year: parseInt(year),
          averageTax: `${avg.toFixed(2)}%`,
        };
      }
    );

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          month: months[currentMonthIndex],
          year: currentYear,
          totalPercentage: `${currentMonthTotal.toFixed(2)}%`,
        },
        currentYear: {
          year: currentYear,
          monthlyBreakdown: Object.entries(currentYearMonthly).map(
            ([month, total]) => ({
              month,
              totalPercentage: `${total.toFixed(2)}%`,
            })
          ),
          averageTax: `${currentYearAverage.toFixed(2)}%`,
        },
        overall: {
          records: overallMonthly.map((rec) => ({
            month: rec.month,
            year: rec.year,
            totalPercentage: `${rec.totalPercentage.toFixed(2)}%`,
          })),
          averageTax: `${overallAverage.toFixed(2)}%`,
        },
        yearlyAverageTax, // <- new addition
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


module.exports = { getTaxes, getTaxById, createTax, updateTax, deleteTax, getTaxSummary };
