import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Profile Info
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    proExpiresAt: {
      type: Date,
      default: null,
    },

    // Settings
    theme: {
      type: String,
      enum: ["purple", "blue", "green", "orange", "pink"],
      default: "purple",
    },
    customDomain: {
      type: String,
      default: "",
    },
    showBranding: {
      type: Boolean,
      default: true,
    },

    // Analytics Settings
    googleAnalyticsId: {
      type: String,
      default: "",
    },
    facebookPixelId: {
      type: String,
      default: "",
    },

    // Payment Info
    paystackCustomerId: {
      type: String,
      default: "",
    },

    // Timestamps
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile data
userSchema.methods.getPublicProfile = function () {
  return {
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    theme: this.theme,
    showBranding: this.showBranding,
    isPro: this.isPro,
    profileViews: this.profileViews,
  };
};

// Check if user can add more links
userSchema.methods.canAddLinks = function (currentLinkCount) {
  if (this.isPro) return true;
  return currentLinkCount < 3; // Free users get 3 links
};

// Virtual for profile URL
userSchema.virtual("profileUrl").get(function () {
  return `https://linkafrika.com/${this.username}`;
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
