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
    const currentMonthIndex = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const startOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const endOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Current Month Total Percentage
    const currentMonthTax = await Tax.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalPercentage: { $sum: "$percentage" },
        },
      },
    ]);

    // Current Year Total Percentage
    const currentYearTax = await Tax.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          totalPercentage: { $sum: "$percentage" },
        },
      },
    ]);

    // Overall Total Percentage
    const allTimeTax = await Tax.aggregate([
      {
        $group: {
          _id: null,
          totalPercentage: { $sum: "$percentage" },
        },
      },
    ]);

    const monthTotal = currentMonthTax[0]?.totalPercentage || 0;
    const yearTotal = currentYearTax[0]?.totalPercentage || 0;
    const overallTotal = allTimeTax[0]?.totalPercentage || 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          month: months[currentMonthIndex],
          year: currentYear,
          totalPercentage: `${monthTotal.toFixed(2)}%`
        },
        currentYear: {
          year: currentYear,
          totalPercentage: `${yearTotal.toFixed(2)}%`
        },
        overall: {
          totalPercentage: `${overallTotal.toFixed(2)}%`
        }
      }
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
