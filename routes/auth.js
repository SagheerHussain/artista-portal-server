const express = require("express");
const router = express.Router();
const upload = require("../upload");

const {
  createAccount,
  loginAccount,
  forgetPassword,
  resetPassword
} = require("../controllers/auth");

router.post("/login", loginAccount);
router.post("/register", upload.single("profilePicture"), createAccount);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
