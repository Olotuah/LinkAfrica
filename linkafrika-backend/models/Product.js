import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["ebook", "course", "service", "template", "other"],
      default: "ebook",
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    paymentLink: {
      type: String,
      trim: true,
      default: "",
      match: [/^https?:\/\/.+/, "Please use a valid URL"],
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
      match: [/^https?:\/\/.+/, "Please use a valid image URL"],
    },

    clicks: {
      type: Number,
      default: 0,
    },

    lastClickedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ userId: 1, isActive: 1 });

// Prevent overwrite error
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
