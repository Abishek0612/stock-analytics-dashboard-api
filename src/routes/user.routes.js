const express = require("express");
const {
  updateFavorites,
  saveDashboardConfig,
  getDashboardConfigs,
  deleteDashboardConfig,
  updateProfile,
  changePassword,
  updateProfilePhoto,
  updateSettings,
  getUserSettings,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.patch("/favorites", updateFavorites);
router.post("/dashboard-configs", saveDashboardConfig);
router.get("/dashboard-configs", getDashboardConfigs);
router.delete("/dashboard-configs/:configId", deleteDashboardConfig);

// Profile and settings routes
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.patch("/profile-photo", updateProfilePhoto);
router.patch("/settings", updateSettings);
router.get("/settings", getUserSettings);

module.exports = router;
