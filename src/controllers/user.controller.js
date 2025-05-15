const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Update user favorite stocks
exports.updateFavorites = async (req, res) => {
  try {
    const { favoriteStocks } = req.body;

    if (!favoriteStocks || !Array.isArray(favoriteStocks)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid favorite stocks data",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { favoriteStocks },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Save dashboard configuration
exports.saveDashboardConfig = async (req, res) => {
  try {
    const { name, stocks, timeframe } = req.body;

    if (!name || !stocks || !Array.isArray(stocks) || !timeframe) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid dashboard configuration data",
      });
    }

    const user = await User.findById(req.user._id);

    user.dashboardConfigurations.push({
      name,
      stocks,
      timeframe,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      data: {
        config:
          user.dashboardConfigurations[user.dashboardConfigurations.length - 1],
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get all dashboard configurations
exports.getDashboardConfigs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        configs: user.dashboardConfigurations,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Delete a dashboard configuration
exports.deleteDashboardConfig = async (req, res) => {
  try {
    const { configId } = req.params;

    const user = await User.findById(req.user._id);

    const configIndex = user.dashboardConfigurations.findIndex(
      (config) => config._id.toString() === configId
    );

    if (configIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Dashboard configuration not found",
      });
    }

    user.dashboardConfigurations.splice(configIndex, 1);

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Dashboard configuration deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({
        status: "fail",
        message: "No data provided for update",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Email is already in use",
        });
      }
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    updatedUser.password = undefined;

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isCorrectPassword = await user.comparePassword(currentPassword);
    if (!isCorrectPassword) {
      return res.status(401).json({
        status: "fail",
        message: "Your current password is incorrect",
      });
    }

    user.password = newPassword;
    user.settings.security.lastPasswordChange = Date.now();
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;

    const photoData =
      req.body.photoData === undefined
        ? req.body.profilePhoto === undefined
          ? ""
          : req.body.profilePhoto
        : req.body.photoData;

    console.log(
      "Updating profile photo for user",
      userId,
      "with data:",
      typeof photoData,
      photoData ? "has data" : "empty"
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: photoData || "" },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Profile photo updated successfully",
      data: {
        profilePhoto: updatedUser.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(400).json({
      status: "error",
      message: "Failed to update profile photo",
      error: error.message,
    });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        status: "fail",
        message: "No settings data provided",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        settings: updatedUser.settings,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        settings: user.settings,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
