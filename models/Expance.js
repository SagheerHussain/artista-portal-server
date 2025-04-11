const mongoose = require("mongoose");

const expanceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    month: { type: String },
    year: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpanceCategory', required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Expance', expanceSchema);
