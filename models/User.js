const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);