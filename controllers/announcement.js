const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("admin");
    console.log(announcements);
    res.status(200).json({
      success: true,
      message: "Announcements fetched successfully",
      announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ status: "active" }).populate("admin");
    res.status(200).json({
      success: true,
      message: "Active announcements fetched successfully",
      announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id).populate("admin");
    res.status(200).json({
      success: true,
      message: "Announcement fetched successfully",
      announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { announcement, admin } = req.body;

    if (!announcement || !admin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const createAnnouncement = await Announcement.create({
      announcement,
      admin,
    });
    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement: createAnnouncement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { announcement, status } = req.body;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      { _id: id },
      { announcement, status },
      {
        new: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
      announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
