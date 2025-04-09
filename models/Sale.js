const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    projectTitle: { type: String, required: true },
    summary: { type: String },
    totalAmount: { type: Number, required: true },
    upfrontAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Partially Paid", "Fully Paid"],
      default: "Partially Paid",
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    leadDate: { type: Date },
    month: { type: String },
    year: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

saleSchema.pre("save", function (next) {
  // Calculate remaining amount
  this.remainingAmount =
    this.totalAmount - (this.receivedAmount + this.upfrontAmount);

  next();
});

module.exports = mongoose.model("Sale", saleSchema);
