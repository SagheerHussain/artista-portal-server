const ExpanceCategory = require("../models/ExpanceCategory");

// Get all expance categories
const getExpanceCategories = async (req, res) => {
  try {
    const expanceCategories = await ExpanceCategory.find();
    res.status(200).json({
      success: true,
      expanceCategories,
      message: "Expance categories fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Create expance category
const createExpanceCategory = async (req, res) => {
  try {
    const { name, admin } = req.body;
    if (!name || !admin) {
      return res.status(200).json({ success: false, message: "Name is required" });
    }
    const newExpanceCategory = await ExpanceCategory.create({ name, admin });
    res.status(200).json({
      success: true,
      message: "Expance category created successfully",
      expanceCategory: newExpanceCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Update expance category
const updateExpanceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedExpanceCategory = await ExpanceCategory.findByIdAndUpdate(
      { _id: id },
      { name },
      { new: true }
    );
    if (!updatedExpanceCategory)
      return res
        .status(404)
        .json({ success: false, message: "Expance category not found" });
    res.status(200).json({
      success: true,
      message: "Expance category updated successfully",
      expanceCategory: updatedExpanceCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Delete expance category
const deleteExpanceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpanceCategory = await ExpanceCategory.findByIdAndDelete(
      { _id: id }
    );
    if (!deletedExpanceCategory)
      return res.status(404).json({ success: false, message: "Expance category not found" });
    res.status(200).json({
      success: true,
      message: "Expance category deleted successfully",
      expanceCategory: deletedExpanceCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = {
  getExpanceCategories,
  createExpanceCategory,
  updateExpanceCategory,
  deleteExpanceCategory,
};
