import express from "express";
import Link from "../models/Link.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/links
// @desc    Get user's links
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort({ order: 1 });

    res.json({ links });
  } catch (error) {
    console.error("Get links error:", error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// @route   POST /api/links
// @desc    Create new link
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { title, url, description, type, backgroundColor, textColor } =
      req.body;

    // Validation
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    // Check link limit for free users
    const user = await User.findById(req.userId);
    const currentLinkCount = await Link.countDocuments({ userId: req.userId });

    if (!user.canAddLinks(currentLinkCount)) {
      return res.status(403).json({
        error:
          "Free users can only have 3 links. Upgrade to Pro for unlimited links.",
      });
    }

    // Create link
    const link = new Link({
      userId: req.userId,
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || "",
      type: type || "website",
      backgroundColor: backgroundColor || "#6366f1",
      textColor: textColor || "#ffffff",
      order: currentLinkCount,
    });

    await link.save();

    res.status(201).json({
      message: "Link created successfully",
      link,
    });
  } catch (error) {
    console.error("Create link error:", error);
    res.status(500).json({ error: "Failed to create link" });
  }
});

// @route   PUT /api/links/:id
// @desc    Update link
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const link = await Link.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const {
      title,
      url,
      description,
      type,
      backgroundColor,
      textColor,
      isActive,
    } = req.body;

    if (title) link.title = title.trim();
    if (url) link.url = url.trim();
    if (description !== undefined) link.description = description.trim();
    if (type) link.type = type;
    if (backgroundColor) link.backgroundColor = backgroundColor;
    if (textColor) link.textColor = textColor;
    if (isActive !== undefined) link.isActive = isActive;

    await link.save();

    res.json({
      message: "Link updated successfully",
      link,
    });
  } catch (error) {
    console.error("Update link error:", error);
    res.status(500).json({ error: "Failed to update link" });
  }
});

// @route   DELETE /api/links/:id
// @desc    Delete link
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});

export default router;
