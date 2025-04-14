const Sale = require("../models/Sale");
const mongoose = require("mongoose");
const User = require("../models/User");
const { getUSDToPKRExchangeRates } = require("../currencyExchangeRates");

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("user paymentMethod");
    res
      .status(200)
      .json({ success: true, sales, message: "Sales fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRevenue = async (req, res) => {
  try {
    const result = await Sale.aggregate([
      {
        $group: {
          _id: null, // Group all documents
          totalSalesAmount: { $sum: "$totalAmount" }, // Sum of totalAmount field
        },
      },
    ]);
    const totalAmount = result[0]?.totalSalesAmount || 0;
    res.status(200).json({
      success: true,
      totalAmount,
      message: "Revenue fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPendingAmount = async (req, res) => {
  try {
    const pendingAmount = await Sale.aggregate([
      {
        $group: {
          _id: null,
          pendingAmount: { $sum: "$remainingAmount" },
        },
      },
    ]);
    const totalAmount = pendingAmount[0]?.pendingAmount || 0;
    res.status(200).json({
      success: true,
      totalAmount,
      message: "Pending Amount fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getTotalReceivedAmount = async (req, res) => {
  try {
    const result = await Sale.aggregate([
      {
        $project: {
          totalReceived: { $add: ["$upfrontAmount", "$receivedAmount"] }, // Add both fields per sale
        },
      },
      {
        $group: {
          _id: null,
          totalReceivedAmount: { $sum: "$totalReceived" }, // Sum of all
        },
      },
    ]);

    const totalReceivedAmount = result[0]?.totalReceivedAmount || 0;

    res.status(200).json({
      success: true,
      totalReceivedAmount,
      message:
        "Total Received Amount (Upfront + Received) calculated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUniqueClients = async (req, res) => {
  try {
    // Get distinct client names
    const uniqueClients = await Sale.distinct("clientName");

    res.status(200).json({
      success: true,
      totalClients: uniqueClients.length,
      uniqueClients,
      message: "Unique client names fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "user paymentMethod"
    );
    res
      .status(200)
      .json({ success: true, sale, message: "Sale fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSalesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sales = await Sale.find({ user: employeeId }).populate(
      "user paymentMethod"
    );
    res.status(200).json({
      success: true,
      sales,
      message: "Employee Sales fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPendingAmountByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sales = await Sale.find({ user: employeeId }).populate(
      "user paymentMethod"
    );
    const totalAmount = sales.reduce(
      (acc, sale) => acc + sale.remainingAmount,
      0
    );
    res.status(200).json({
      success: true,
      totalAmount,
      message: "Employee Pending Amount fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRecieveAmountByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sales = await Sale.find({ user: employeeId }).populate(
      "user paymentMethod"
    );
    const totalAmount = sales.reduce(
      (acc, sale) => acc + (sale.receivedAmount + sale.upfrontAmount),
      0
    );
    res.status(200).json({
      success: true,
      totalReceivedAmount: totalAmount,
      message: "Employee Received Amount fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getClientsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sales = await Sale.find({ user: employeeId }).populate(
      "user paymentMethod"
    );
    const clients = sales.map((sale) => sale.clientName);
    const uniqueClients = [...new Set(clients)];
    res.status(200).json({
      success: true,
      totalClients: uniqueClients.length,
      message: "Employee Clients fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getFilteredSales = async (req, res) => {
  try {
    const { month, year, search, status, user } = req.query;

    let query = {};

    // Employee filter (only if valid ObjectId)
    if (user && mongoose.Types.ObjectId.isValid(user)) {
      query.user = user;
    }

    // Month filter
    if (month) {
      query.month = { $regex: new RegExp(`^${month}$`, "i") }; // case-insensitive
    }

    // Year filter
    if (year) {
      query.year = Number(year);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search filter (clientName or projectTitle)
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
      ];
    }

    const sales = await Sale.find(query).populate("user paymentMethod");

    res.status(200).json({
      success: true,
      sales,
      message: "Filtered Sales fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getFilteredSalesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year, status, search } = req.query;

    let query = {
      user: employeeId, // Employee filter
    };

    // Apply Month Filter
    if (month && month !== "") {
      query.month = { $regex: new RegExp(`^${month}$`, "i") }; // case-insensitive
    }

    // Apply Year Filter
    if (year && year !== "") {
      query.year = parseInt(year);
    }

    // Apply Status Filter
    if (status && status !== "") {
      query.status = status;
    }

    // Apply Search Filter (clientName OR projectTitle)
    if (search && search !== "") {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
      ];
    }

    const sales = await Sale.find(query).populate("user paymentMethod");

    res.status(200).json({
      success: true,
      sales,
      message: "Filtered sales fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getEmployeeCurrentSalesAmount = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const now = new Date();

    // Current month range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Current year range
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    // Monthly Sales
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(employeeId),
          leadDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalMonthlySales = monthlySales[0]?.totalSales || 0;

    // Yearly Sales
    const yearlySales = await Sale.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(employeeId),
          leadDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalYearlySales = yearlySales[0]?.totalSales || 0;

    // Final Response
    res.status(200).json({
      success: true,
      totalMonthlySales,
      totalYearlySales,
      message: "Employee Current Sales Amount fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const createSale = async (req, res) => {
  try {
    const {
      clientName,
      projectTitle,
      summary,
      totalAmount,
      upfrontAmount,
      status,
      paymentMethod,
      user,
    } = req.body;

    if (!clientName || !projectTitle || !summary || !totalAmount || !upfrontAmount || !status || !paymentMethod || !user) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isExist = await User.findById({ _id: user });
    if (!isExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const date = new Date();

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
    const currentMonth = months[date.getMonth()];
    const currentYear = date.getFullYear();

    const newSale = await Sale.create({
      clientName,
      projectTitle,
      summary,
      totalAmount,
      upfrontAmount,
      status,
      paymentMethod,
      leadDate: date.toISOString(),
      month: currentMonth,
      year: currentYear,
      user,
    });
    res.status(200).json({
      success: true,
      message: "Sale created successfully",
      newSale,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      projectTitle,
      summary,
      totalAmount,
      upfrontAmount,
      receivedAmount,
      status,
      paymentMethod,
      user,
    } = req.body;

    const sale = await Sale.findById({ _id: id });
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Safe fallback:
    const upfront =
      typeof upfrontAmount !== "undefined"
        ? Number(upfrontAmount)
        : sale.upfrontAmount;
    const received =
      typeof receivedAmount !== "undefined"
        ? Number(receivedAmount)
        : sale.receivedAmount;
    const total =
      typeof totalAmount !== "undefined"
        ? Number(totalAmount)
        : sale.totalAmount;
    const remaining = total - (received + upfront);

    const updatedSale = await Sale.findByIdAndUpdate(
      { _id: id },
      {
        clientName: clientName || sale.clientName,
        projectTitle: projectTitle || sale.projectTitle,
        summary: summary || sale.summary,
        upfrontAmount: upfront,
        totalAmount: total,
        receivedAmount: received,
        remainingAmount: remaining,
        status: status || sale.status,
        paymentMethod: paymentMethod || sale.paymentMethod,
        user: user || sale.user,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      sale: updatedSale,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      sale,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const bulkDeleteSales = async (req, res) => {
  try {
    const { ids } = req.body;
    const sales = await Sale.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: "Sales deleted successfully",
      sales,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getMonthlySalesData = async (req, res) => {
  try {
    const conversionRate = await getUSDToPKRExchangeRates();

    const monthNames = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();

    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      year: currentYear,
      totalSales: 0,
      totalReceived: 0,
      count: 0
    }));

    const monthlySalesData = await Sale.aggregate([
      {
        $match: {
          year: currentYear,
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalSales: { $sum: "$totalAmount" },
          totalReceived: {
            $sum: { $add: ["$upfrontAmount", "$receivedAmount"] }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const finalData = allMonths.map(month => {
      const actualData = monthlySalesData.find(sale =>
        sale._id.month.toLowerCase() === month.month.toLowerCase()
      );

      return actualData
        ? {
            month: month.month,
            year: actualData._id.year,
            totalSales: (actualData.totalSales * conversionRate).toFixed(0),
            totalReceived: (actualData.totalReceived * conversionRate).toFixed(0),
            count: actualData.count
          }
        : month;
    });

    res.status(200).json({
      success: true,
      data: finalData,
      message: "Monthly sales data fetched successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getYearlySalesData = async (req, res) => {
  try {
    const conversionRate = await getUSDToPKRExchangeRates();

    const yearlySalesData = await Sale.aggregate([
      {
        $group: {
          _id: { year: "$year" },
          totalSales: { $sum: "$totalAmount" },
          totalReceived: {
            $sum: { $add: ["$upfrontAmount", "$receivedAmount"] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalSales: 1,
          totalReceived: 1,
          count: 1
        }
      },
      {
        $sort: { year: 1 }
      }
    ]);

    const convertedData = yearlySalesData.map(item => ({
      year: item.year,
      totalSales: (item.totalSales * conversionRate).toFixed(0),
      totalReceived: (item.totalReceived * conversionRate).toFixed(0),
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: convertedData,
      message: "Yearly sales data fetched successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = {
  getSales,
  getRevenue,
  getUniqueClients,
  getPendingAmount,
  getTotalReceivedAmount,
  getSaleById,
  getSalesByEmployeeId,
  getClientsByEmployee,
  getPendingAmountByEmployee,
  getRecieveAmountByEmployee,
  getClientsByEmployee,
  getEmployeeCurrentSalesAmount,
  getFilteredSales,
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
  getFilteredSalesByEmployee,
  getMonthlySalesData,
  getYearlySalesData
};
