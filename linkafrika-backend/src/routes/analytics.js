import express from "express";
import Analytics from "../models/Analytics.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track an event (click, view, etc.)
// @access  Public
router.post("/track", async (req, res) => {
  try {
    const { userId, linkId, eventType } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers.referer || "";

    // Parse user agent for device info
    const deviceInfo = Analytics.parseUserAgent(userAgent);

    const analyticsEvent = new Analytics({
      userId,
      linkId: linkId || null,
      eventType,
      ipAddress,
      userAgent,
      referrer,
      ...deviceInfo,
      timestamp: new Date(),
    });

    await analyticsEvent.save();

    res.json({ message: "Event tracked successfully" });
  } catch (error) {
    console.error("Track event error:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
});

// @route   GET /api/analytics/stats
// @desc    Get user analytics stats
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get daily stats
    const dailyStats = await Analytics.getDailyStats(
      req.userId,
      parseInt(days)
    );

    // Get top links
    const topLinks = await Analytics.getTopLinks(req.userId, 10);

    // Get geographic stats
    const geoStats = await Analytics.getGeographicStats(
      req.userId,
      parseInt(days)
    );

    // Get device stats
    const deviceStats = await Analytics.getDeviceStats(
      req.userId,
      parseInt(days)
    );

    res.json({
      dailyStats,
      topLinks,
      geoStats,
      deviceStats,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
