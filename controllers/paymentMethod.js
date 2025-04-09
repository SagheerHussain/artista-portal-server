const PaymentMethod = require("../models/PaymentMethod");

// Get all payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find();
    res.status(200).json({
      success: true,
      paymentMethods,
      message: "Payment methods fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Create payment method
const createPaymentMethod = async (req, res) => {
  try {
    const { method } = req.body;
    const newPaymentMethod = await PaymentMethod.create({ method });
    res.status(200).json({
      success: true,
      message: "Payment method created successfully",
      paymentMethod: newPaymentMethod,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Update payment method
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;
    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      { _id: id },
      { method },
      { new: true }
    );
    if (!updatedPaymentMethod)
      return res
        .status(404)
        .json({ success: false, message: "Payment method not found" });
    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      paymentMethod: updatedPaymentMethod,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Delete payment method
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPaymentMethod = await PaymentMethod.findByIdAndDelete(
      { _id: id }
    );
    if (!deletedPaymentMethod)
      return res.status(404).json({ success: false, message: "Payment method not found" });
    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
      paymentMethod: deletedPaymentMethod,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
