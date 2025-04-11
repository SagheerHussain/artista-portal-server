const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    announcement: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Announcement', announcementSchema);
