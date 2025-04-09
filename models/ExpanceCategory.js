const mongoose = require("mongoose");

const expanceCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

module.exports = mongoose.model('ExpanceCategory', expanceCategorySchema);