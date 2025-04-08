const User = require("../models/User");
const cloudinary = require("../cloudinary");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Password hide karne ke liye
    if (users.length < 0)
      return res.status(404).json({ message: "Users not found" });

    res
      .status(200)
      .json({
        success: true,
        users: users,
        message: "Users fetched successfully",
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); // Password hide karne ke liye
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    res.status(200).json({ success: true, user, message: "User fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById({ _id: id });
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    let profilePicturePath = user.profilePicture;

    if (req.file) {
      const imgUpload = await cloudinary.uploader.upload(req.file.path);
      profilePicturePath = imgUpload.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      {
        name,
        email,
        role,
        profilePicture: profilePicturePath,
      },
      {
        new: true,
      }
    );

    if (!updatedUser)
      return res
        .status(404)
        .json({ message: "User not Updated", success: false });

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Account deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  deleteUserAccount,
};
