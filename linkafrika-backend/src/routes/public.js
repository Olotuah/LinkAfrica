import express from "express";
import User from "../models/User.js";
import Link from "../models/Link.js";
import Analytics from "../models/Analytics.js";

const router = express.Router();

// @route   GET /api/public/:username
// @desc    Get public profile and links
// @access  Public
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get active links
    const links = await Link.getActiveLinks(user._id);

    // Track profile view
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers.referer || "";
    const deviceInfo = Analytics.parseUserAgent(userAgent);

    // Create analytics event (don't wait for it)
    Analytics.create({
      userId: user._id,
      linkId: null,
      eventType: "view",
      ipAddress,
      userAgent,
      referrer,
      ...deviceInfo,
    }).catch((err) => console.error("Analytics tracking error:", err));

    // Increment profile views
    User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } }).catch(
      (err) => console.error("Profile view increment error:", err)
    );

    // Return public profile data
    const publicProfile = {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      showBranding: user.showBranding,
      isPro: user.isPro,
      profileViews: user.profileViews + 1,
    };

    res.json({
      profile: publicProfile,
      links: links.map((link) => ({
        id: link._id,
        title: link.title,
        url: link.url,
        description: link.description,
        type: link.type,
        icon: link.icon,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        isProduct: link.isProduct,
        price: link.price,
        currency: link.currency,
      })),
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// @route   POST /api/public/click/:linkId
// @desc    Track link click
// @access  Public
router.post("/click/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    // Find link and increment clicks
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Increment click count
    await link.incrementClicks();

    // Track analytics
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers.referer || "";
    const deviceInfo = Analytics.parseUserAgent(userAgent);

    Analytics.create({
      userId: link.userId,
      linkId: link._id,
      eventType: "click",
      ipAddress,
      userAgent,
      referrer,
      ...deviceInfo,
    }).catch((err) => console.error("Analytics tracking error:", err));

    res.json({
      message: "Click tracked successfully",
      url: link.type === "whatsapp" ? link.getWhatsAppUrl() : link.url,
    });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

export default router;
