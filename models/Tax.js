const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
    percentage: { type: Number, required: true },
    date: { type: Date },
    month: { type: String },
    year: { type: Number }
});

module.exports = mongoose.model('Tax', taxSchema);