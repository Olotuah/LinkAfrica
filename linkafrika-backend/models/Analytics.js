import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: false, // null for profile views
      index: true,
    },

    // Event Type
    eventType: {
      type: String,
      enum: ["click", "view", "conversion", "signup"],
      required: true,
      index: true,
    },

    // Visitor Information
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    referrer: {
      type: String,
      default: "",
    },

    // Geographic Data
    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "",
    },

    // Device Information
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
      default: "",
    },
    os: {
      type: String,
      default: "",
    },

    // Additional Data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

// Compound indexes for efficient queries
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ linkId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 }); // For cleanup operations

// TTL index to automatically delete old analytics data (optional)
// Keeps data for 1 year, then deletes automatically
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Static methods for analytics queries

// Get daily stats for a user
analyticsSchema.statics.getDailyStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          eventType: "$eventType",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        events: {
          $push: {
            type: "$_id.eventType",
            count: "$count",
          },
        },
        totalEvents: { $sum: "$count" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

// Get top performing links
analyticsSchema.statics.getTopLinks = async function (userId, limit = 10) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        linkId: { $ne: null },
        eventType: "click",
      },
    },
    {
      $group: {
        _id: "$linkId",
        clicks: { $sum: 1 },
        lastClick: { $max: "$timestamp" },
      },
    },
    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "_id",
        as: "link",
      },
    },
    {
      $unwind: "$link",
    },
    {
      $project: {
        linkId: "$_id",
        title: "$link.title",
        url: "$link.url",
        type: "$link.type",
        clicks: 1,
        lastClick: 1,
      },
    },
    {
      $sort: { clicks: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

// Get geographic distribution
analyticsSchema.statics.getGeographicStats = async function (
  userId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        country: { $ne: "" },
      },
    },
    {
      $group: {
        _id: "$country",
        visits: { $sum: 1 },
        uniqueIps: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        country: "$_id",
        visits: 1,
        uniqueVisitors: { $size: "$uniqueIps" },
      },
    },
    {
      $sort: { visits: -1 },
    },
    {
      $limit: 20,
    },
  ]);
};

// Get device/browser stats
analyticsSchema.statics.getDeviceStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        deviceTypes: {
          $push: "$deviceType",
        },
        browsers: {
          $push: "$browser",
        },
        operatingSystems: {
          $push: "$os",
        },
      },
    },
    {
      $project: {
        deviceDistribution: {
          $reduce: {
            input: "$deviceTypes",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: [
                    [
                      {
                        k: "$$this",
                        v: {
                          $add: [
                            {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "$$this",
                                    input: "$$value",
                                  },
                                },
                                0,
                              ],
                            },
                            1,
                          ],
                        },
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
        browserDistribution: {
          $reduce: {
            input: "$browsers",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: [
                    [
                      {
                        k: "$$this",
                        v: {
                          $add: [
                            {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "$$this",
                                    input: "$$value",
                                  },
                                },
                                0,
                              ],
                            },
                            1,
                          ],
                        },
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);
};

// Helper method to parse user agent and extract device info
analyticsSchema.statics.parseUserAgent = function (userAgent) {
  const ua = userAgent.toLowerCase();

  let deviceType = "unknown";
  let browser = "unknown";
  let os = "unknown";

  // Device type detection
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }

  // Browser detection
  if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari")) browser = "Safari";
  else if (ua.includes("edge")) browser = "Edge";
  else if (ua.includes("opera")) browser = "Opera";

  // OS detection
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    os = "iOS";

  return { deviceType, browser, os };
};

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
