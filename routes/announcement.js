const express = require("express");

const router = express.Router();

const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} = require("../controllers/announcement");

const { authenticateToken, admin } = require("../middlewares/authorization");

router.get("/", authenticateToken, admin, getAnnouncements);

router.get("/active/announcement", authenticateToken, getActiveAnnouncements);

router.get("/:id", authenticateToken, admin, getAnnouncementById);

router.post("/", authenticateToken, admin, createAnnouncement);

router.put("/update/:id", authenticateToken, admin, updateAnnouncement);

router.delete("/delete/:id", authenticateToken, admin, deleteAnnouncement);

module.exports = router;
