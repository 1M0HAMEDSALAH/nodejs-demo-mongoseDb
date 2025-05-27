const authenticateToken = require("../middleware/authe");
const express = require("express");
const router = express.Router();


router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
});
