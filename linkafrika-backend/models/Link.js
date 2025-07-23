import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic Link Info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // Link Type & Appearance
    type: {
      type: String,
      enum: [
        "social",
        "whatsapp",
        "product",
        "youtube",
        "website",
        "email",
        "phone",
      ],
      default: "website",
    },
    icon: {
      type: String,
      default: "link",
    },
    backgroundColor: {
      type: String,
      default: "#6366f1",
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },

    // Product-specific fields (for selling)
    isProduct: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD", "GHS", "KES", "ZAR"],
      default: "NGN",
    },
    paystackProductCode: {
      type: String,
      default: "",
    },

    // Display & Behavior
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    opensInNewTab: {
      type: Boolean,
      default: true,
    },

    // Analytics
    clicks: {
      type: Number,
      default: 0,
    },
    lastClickedAt: {
      type: Date,
      default: null,
    },

    // Scheduling (Pro feature)
    scheduledStart: {
      type: Date,
      default: null,
    },
    scheduledEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
linkSchema.index({ userId: 1, order: 1 });
linkSchema.index({ userId: 1, isActive: 1 });
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ type: 1 });

// Methods
linkSchema.methods.incrementClicks = function () {
  this.clicks += 1;
  this.lastClickedAt = new Date();
  return this.save();
};

// Check if link is currently scheduled to be visible
linkSchema.methods.isScheduledVisible = function () {
  const now = new Date();

  if (this.scheduledStart && now < this.scheduledStart) {
    return false;
  }

  if (this.scheduledEnd && now > this.scheduledEnd) {
    return false;
  }

  return true;
};

// Static method to get user's active links
linkSchema.statics.getActiveLinks = function (userId) {
  const now = new Date();

  return this.find({
    userId,
    isActive: true,
    $or: [{ scheduledStart: null }, { scheduledStart: { $lte: now } }],
    $or: [{ scheduledEnd: null }, { scheduledEnd: { $gte: now } }],
  }).sort({ order: 1 });
};

// Generate WhatsApp URL helper
linkSchema.methods.getWhatsAppUrl = function (message = "") {
  if (this.type === "whatsapp") {
    const phoneNumber = this.url.replace(/[^\d]/g, ""); // Extract numbers only
    const encodedMessage = encodeURIComponent(
      message || `Hi! I found you on LinkAfrika`
    );
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
  return this.url;
};

// Validate URL format
linkSchema.pre("save", function (next) {
  // Basic URL validation
  if (
    this.type !== "whatsapp" &&
    this.type !== "email" &&
    this.type !== "phone"
  ) {
    try {
      new URL(this.url);
    } catch (error) {
      return next(new Error("Invalid URL format"));
    }
  }

  // WhatsApp validation
  if (this.type === "whatsapp") {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = this.url.replace(/[^\d+]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return next(new Error("Invalid WhatsApp phone number"));
    }
  }

  next();
});

const Link = mongoose.model("Link", linkSchema);

export default Link;
