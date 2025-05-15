const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    favoriteStocks: {
      type: [String],
      default: [],
    },
    dashboardConfigurations: [
      {
        name: String,
        stocks: [String],
        timeframe: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      emailNotifications: {
        dailyReport: {
          type: Boolean,
          default: false,
        },
        weeklyReport: {
          type: Boolean,
          default: true,
        },
        priceAlerts: {
          type: Boolean,
          default: true,
        },
        newsAlerts: {
          type: Boolean,
          default: true,
        },
      },
      security: {
        twoFactorEnabled: {
          type: Boolean,
          default: false,
        },
        lastPasswordChange: {
          type: Date,
          default: Date.now,
        },
      },
      theme: {
        type: String,
        default: "dark",
        enum: ["light", "dark", "system"],
      },
      chartPreferences: {
        defaultTimeframe: {
          type: String,
          default: "1M",
          enum: ["1D", "1W", "1M", "3M", "1Y", "YTD", "MTD", "custom"],
        },
        showVolume: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
