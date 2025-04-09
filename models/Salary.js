const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  paidDate: { type: Date, required: true },
  bonus: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
});

salarySchema.pre("save", function (next) {
  this.totalAmount = this.amount + this.bonus;
  next();
});

module.exports = mongoose.model("Salary", salarySchema);
