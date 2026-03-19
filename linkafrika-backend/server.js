import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import Link from "./models/Link.js";
import Product from "./models/Product.js";
import { auth } from "./src/middleware/auth.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================
   SIMPLE ANALYTICS MODEL
   =================== */
const analyticsSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Analytics =
  mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);

/* ===================
   HELPERS
   =================== */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const sanitizeUser = async (userId) => {
  return await User.findById(userId).select("-password");
};

const makeTempUsername = async (email) => {
  const emailBase = (email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  const safeBase = emailBase || `user${Date.now()}`;
  let candidate = safeBase;
  let counter = 1;

  while (await User.findOne({ username: candidate })) {
    candidate = `${safeBase}${counter}`;
    counter += 1;
  }

  return candidate;
};

const safeTrim = (value) =>
  typeof value === "string" ? value.trim() : value;

const safeLowerTrim = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

/* ===================
   CORS
   =================== */
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://link-africa.vercel.app",
        "https://linkafrica.vercel.app",
        "https://linkafrika.tech",
        "https://www.linkafrika.tech",
        process.env.FRONTEND_URL,
      ].filter(Boolean)
    : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===================
   MIDDLEWARE
   =================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/* ===================
   HEALTH / TEST
   =================== */
app.get("/health", async (req, res) => {
  try {
    const [usersCount, linksCount, productsCount, analyticsCount] =
      await Promise.all([
        User.countDocuments(),
        Link.countDocuments(),
        Product.countDocuments(),
        Analytics.countDocuments(),
      ]);

    res.json({
      status: "OK",
      message: "LinkAfrika API is running!",
      users: usersCount,
      links: linksCount,
      products: productsCount,
      analytics: analyticsCount,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
    });
  }
});

app.get("/test", (req, res) => {
  res.json({
    message: "Hello from LinkAfrika backend!",
    environment: process.env.NODE_ENV || "development",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/check-username",
      "GET /api/auth/me",
      "GET /api/user/profile",
      "PUT /api/user/profile",
      "GET /api/links",
      "POST /api/links",
      "PUT /api/links/:id",
      "DELETE /api/links/:id",
      "GET /api/products",
      "POST /api/products",
      "PUT /api/products/:id",
      "DELETE /api/products/:id",
      "GET /api/analytics/stats",
      "POST /api/analytics/track",
      "GET /api/public/:username",
      "POST /api/public/click/:linkId",
    ],
  });
});

/* ===================
   AUTH ROUTES
   =================== */

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("📝 Register request:", req.body);

    const { name, email, password, username, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = safeLowerTrim(email);

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    let finalUsername = username ? safeLowerTrim(username) : "";
    if (!finalUsername) {
      finalUsername = await makeTempUsername(cleanEmail);
    }

    const usernameTaken = await User.findOne({ username: finalUsername });
    if (usernameTaken) {
      return res.status(400).json({
        message: "Username is already taken",
      });
    }

    const finalDisplayName =
      safeTrim(displayName) || safeTrim(name) || cleanEmail.split("@")[0];

    const newUser = await User.create({
      username: finalUsername,
      email: cleanEmail,
      password,
      displayName: finalDisplayName,
      bio: "",
      avatarUrl: "",
      isPro: false,
      theme: "purple",
      profileViews: 0,
      lastLoginAt: new Date(),
    });

    const token = generateToken(newUser._id);
    const userWithoutPassword = await sanitizeUser(newUser._id);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const cleanEmail = safeLowerTrim(email);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({
        error: "No account found with this email address",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    const userWithoutPassword = await sanitizeUser(user._id);

    console.log("✅ User logged in:", user.email);

    res.json({
      message: "Login successful!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: error.message,
    });
  }
});

// CHECK USERNAME
app.post("/api/auth/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: "Username is required",
        available: false,
      });
    }

    const cleanUsername = safeLowerTrim(username);

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        error: "Username must be at least 3 characters long",
        available: false,
      });
    }

    const existingUser = await User.findOne({ username: cleanUsername });

    res.json({
      available: !existingUser,
      message: existingUser
        ? "Username is already taken"
        : "Username is available!",
    });
  } catch (error) {
    console.error("❌ Check username error:", error);
    res.status(500).json({
      error: "Error checking username",
      available: false,
    });
  }
});

// GET CURRENT USER
app.get("/api/auth/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

/* ===================
   USER ROUTES
   =================== */

// GET USER PROFILE
app.get("/api/user/profile", auth, async (req, res) => {
  res.json(req.user);
});

// UPDATE USER PROFILE
app.put("/api/user/profile", auth, async (req, res) => {
  try {
    console.log("📝 Profile update request:", req.body);

    const {
      username,
      displayName,
      bio,
      theme,
      avatarUrl,
      onboardingCompleted,
      isPro,
      customDomain,
      showBranding,
      googleAnalyticsId,
      facebookPixelId,
    } = req.body;

    if (
      username &&
      safeLowerTrim(username) !== safeLowerTrim(req.user.username || "")
    ) {
      const cleanUsername = safeLowerTrim(username);

      const existingUser = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Username is already taken",
        });
      }
    }

    const updatePayload = {};

    if (username !== undefined) updatePayload.username = safeLowerTrim(username);
    if (displayName !== undefined) updatePayload.displayName = safeTrim(displayName);
    if (bio !== undefined) updatePayload.bio = safeTrim(bio) || "";
    if (theme !== undefined) updatePayload.theme = theme;
    if (avatarUrl !== undefined) updatePayload.avatarUrl = safeTrim(avatarUrl) || "";
    if (onboardingCompleted !== undefined)
      updatePayload.onboardingCompleted = onboardingCompleted;
    if (isPro !== undefined) updatePayload.isPro = isPro;
    if (customDomain !== undefined)
      updatePayload.customDomain = safeTrim(customDomain) || "";
    if (showBranding !== undefined) updatePayload.showBranding = showBranding;
    if (googleAnalyticsId !== undefined)
      updatePayload.googleAnalyticsId = safeTrim(googleAnalyticsId) || "";
    if (facebookPixelId !== undefined)
      updatePayload.facebookPixelId = safeTrim(facebookPixelId) || "";

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatePayload, {
      new: true,
      runValidators: true,
    }).select("-password");

    console.log("✅ User profile updated");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      error: "Failed to update profile",
      message: error.message,
    });
  }
});

/* ===================
   LINKS ROUTES
   =================== */

// GET USER LINKS
app.get("/api/links", auth, async (req, res) => {
  try {
    const userLinks = await Link.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    console.log(`📋 Retrieved ${userLinks.length} links for user:`, req.user.email);
    res.json(userLinks);
  } catch (error) {
    console.error("❌ Get links error:", error);
    res.status(500).json({
      error: "Failed to load links",
      message: error.message,
    });
  }
});

// CREATE LINK
app.post("/api/links", auth, async (req, res) => {
  try {
    console.log("🔗 Create link request:", req.body);

    const { title, url, type, description, isActive = true } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        error: "Title and URL are required",
      });
    }

    const currentLinksCount = await Link.countDocuments({ userId: req.user._id });

    if (!req.user.isPro && currentLinksCount >= 3) {
      return res.status(400).json({
        error: "Free users are limited to 3 links. Upgrade to Pro for unlimited links.",
      });
    }

    const newLink = await Link.create({
      userId: req.user._id,
      title: safeTrim(title),
      url: safeTrim(url),
      type: type || "social",
      description: description ? safeTrim(description) : "",
      isActive,
      clicks: 0,
    });

    console.log("✅ Link created:", newLink.title, "for user:", req.user.email);

    res.status(201).json({
      message: "Link created successfully",
      link: newLink,
    });
  } catch (error) {
    console.error("❌ Create link error:", error);
    res.status(500).json({
      error: "Failed to create link",
      message: error.message,
    });
  }
});

// UPDATE LINK
app.put("/api/links/:id", auth, async (req, res) => {
  try {
    const { title, url, type, description, isActive } = req.body;

    const updatePayload = {};

    if (title !== undefined) updatePayload.title = safeTrim(title);
    if (url !== undefined) updatePayload.url = safeTrim(url);
    if (type !== undefined) updatePayload.type = type;
    if (description !== undefined) updatePayload.description = safeTrim(description) || "";
    if (isActive !== undefined) updatePayload.isActive = isActive;

    const updatedLink = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ error: "Link not found" });
    }

    console.log("✅ Link updated:", updatedLink.title);

    res.json({
      message: "Link updated successfully",
      link: updatedLink,
    });
  } catch (error) {
    console.error("❌ Update link error:", error);
    res.status(500).json({
      error: "Failed to update link",
      message: error.message,
    });
  }
});

// DELETE LINK
app.delete("/api/links/:id", auth, async (req, res) => {
  try {
    const deletedLink = await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedLink) {
      return res.status(404).json({ error: "Link not found" });
    }

    console.log("🗑️ Link deleted:", deletedLink.title);

    res.json({
      message: "Link deleted successfully",
      link: deletedLink,
    });
  } catch (error) {
    console.error("❌ Delete link error:", error);
    res.status(500).json({
      error: "Failed to delete link",
      message: error.message,
    });
  }
});

/* ===================
   PRODUCTS ROUTES
   =================== */

// GET USER PRODUCTS
app.get("/api/products", auth, async (req, res) => {
  try {
    const userProducts = await Product.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    console.log(
      `🛍️ Retrieved ${userProducts.length} products for user:`,
      req.user.email
    );

    res.json(userProducts);
  } catch (error) {
    console.error("❌ Get products error:", error);
    res.status(500).json({
      message: "Failed to load products",
      error: error.message,
    });
  }
});

// CREATE PRODUCT
app.post("/api/products", auth, async (req, res) => {
  try {
    console.log("🛍️ Create product request:", req.body);

    const { type, name, price, description, paymentLink, imageUrl } = req.body;

    if (!name || price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        message: "Product name and valid price are required",
      });
    }

    if (!req.user.isPro) {
      return res.status(403).json({
        message: "Only Pro users can add digital products",
      });
    }

    const newProduct = await Product.create({
      userId: req.user._id,
      type: type || "ebook",
      name: safeTrim(name),
      price: Number(price),
      description: description ? safeTrim(description) : "",
      paymentLink: paymentLink ? safeTrim(paymentLink) : "",
      imageUrl: imageUrl ? safeTrim(imageUrl) : "",
      isActive: true,
    });

    console.log("✅ Product created:", newProduct.name, "for user:", req.user.email);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// UPDATE PRODUCT
app.put("/api/products/:id", auth, async (req, res) => {
  try {
    const { type, name, price, description, paymentLink, imageUrl, isActive } =
      req.body;

    const updatePayload = {};

    if (type !== undefined) updatePayload.type = type;
    if (name !== undefined) updatePayload.name = safeTrim(name);
    if (price !== undefined) updatePayload.price = Number(price);
    if (description !== undefined) updatePayload.description = safeTrim(description) || "";
    if (paymentLink !== undefined) updatePayload.paymentLink = safeTrim(paymentLink) || "";
    if (imageUrl !== undefined) updatePayload.imageUrl = safeTrim(imageUrl) || "";
    if (isActive !== undefined) updatePayload.isActive = isActive;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product updated:", updatedProduct.name);

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// DELETE PRODUCT
app.delete("/api/products/:id", auth, async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("🗑️ Product deleted:", deletedProduct.name);

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

/* ===================
   ANALYTICS ROUTES
   =================== */

// GET ANALYTICS STATS
app.get("/api/analytics/stats", auth, async (req, res) => {
  try {
    const userLinks = await Link.find({ userId: req.user._id });

    const totalClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalLinks = userLinks.length;
    const activeLinks = userLinks.filter((link) => link.isActive).length;

    const days = Number(req.query.days || 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const linkClickEvents = await Analytics.find({
      event: "link_click",
      "data.userId": req.user._id.toString(),
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const profileViewEvents = await Analytics.find({
      event: "profile_view",
      "data.userId": req.user._id.toString(),
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const dailyStatsMap = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyStatsMap[key] = { date: key, clicks: 0, views: 0 };
    }

    linkClickEvents.forEach((event) => {
      const key = new Date(event.createdAt).toISOString().split("T")[0];
      if (dailyStatsMap[key]) dailyStatsMap[key].clicks += 1;
    });

    profileViewEvents.forEach((event) => {
      const key = new Date(event.createdAt).toISOString().split("T")[0];
      if (dailyStatsMap[key]) dailyStatsMap[key].views += 1;
    });

    const dailyStats = Object.values(dailyStatsMap);

    const topLink = userLinks.reduce(
      (top, link) => ((link.clicks || 0) > (top?.clicks || 0) ? link : top),
      null
    );

    const profileViews = req.user.profileViews || 0;

    const stats = {
      totalClicks,
      totalLinks,
      activeLinks,
      profileViews,
      monthlyGrowth: totalClicks > 0 ? Math.floor(Math.random() * 25) + 5 : 0,
      earnings: req.user.isPro ? Math.floor(totalClicks * 0.5) : 0,
      conversionRate:
        profileViews > 0 ? ((totalClicks / profileViews) * 100).toFixed(1) : "0.0",
      topLink: topLink ? topLink.title : "None yet",
      dailyStats,
    };

    console.log(`📊 Generated analytics for user:`, req.user.email);

    res.json(stats);
  } catch (error) {
    console.error("❌ Analytics stats error:", error);
    res.status(500).json({
      error: "Failed to load analytics",
      message: error.message,
    });
  }
});

// TRACK EVENT
app.post("/api/analytics/track", async (req, res) => {
  try {
    const { event, data } = req.body;

    await Analytics.create({
      event,
      data,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    console.log("📊 Analytics event tracked:", event);

    res.json({
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("❌ Track analytics error:", error);
    res.status(500).json({
      message: "Failed to track analytics event",
      error: error.message,
    });
  }
});

/* ===================
   PUBLIC ROUTES
   =================== */

// GET PUBLIC PROFILE
app.get("/api/public/:username", async (req, res) => {
  try {
    const requestedUsername = safeLowerTrim(req.params.username);

    console.log("🌍 Public profile request for:", requestedUsername);

    let user = await User.findOne({ username: requestedUsername });

    if (!user) {
      user = await User.findOne({ email: requestedUsername });
    }

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const userLinks = await Link.find({
      userId: user._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    const userProducts = await Product.find({
      userId: user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    await User.findByIdAndUpdate(user._id, {
      $inc: { profileViews: 1 },
    });

    await Analytics.create({
      event: "profile_view",
      data: {
        userId: user._id.toString(),
        username: user.username,
      },
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    const refreshedUser = await User.findById(user._id);

    const publicProfile = {
      id: refreshedUser._id,
      username: refreshedUser.username,
      displayName: refreshedUser.displayName,
      bio: refreshedUser.bio || "",
      avatarUrl: refreshedUser.avatarUrl || "",
      theme: refreshedUser.theme || "purple",
      isPro: refreshedUser.isPro || false,
      profileViews: refreshedUser.profileViews || 0,
      email: refreshedUser.email,
      links: userLinks.map((link) => ({
        id: link._id,
        title: link.title,
        url: link.url,
        type: link.type,
        description: link.description,
        clicks: link.clicks,
        isActive: link.isActive,
      })),
      products: userProducts.map((product) => ({
        id: product._id,
        type: product.type,
        name: product.name,
        price: product.price,
        description: product.description,
        paymentLink: product.paymentLink,
        imageUrl: product.imageUrl || "",
        isActive: product.isActive,
        createdAt: product.createdAt,
      })),
    };

    console.log(
      `✅ Public profile served for ${refreshedUser.email} with ${userLinks.length} links and ${userProducts.length} products`
    );

    res.json(publicProfile);
  } catch (error) {
    console.error("❌ Public profile error:", error);
    res.status(500).json({
      error: "Failed to load public profile",
      message: error.message,
    });
  }
});

// TRACK LINK CLICK
app.post("/api/public/click/:linkId", async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    link.clicks += 1;
    link.lastClickedAt = new Date();
    await link.save();

    await Analytics.create({
      event: "link_click",
      data: {
        linkId: link._id.toString(),
        linkTitle: link.title,
        linkUrl: link.url,
        userId: link.userId.toString(),
      },
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    console.log("📊 Link clicked:", link.title, "- Total clicks:", link.clicks);

    res.json({
      message: "Click tracked successfully",
      clicks: link.clicks,
    });
  } catch (error) {
    console.error("❌ Public click error:", error);
    res.status(500).json({
      error: "Failed to track click",
      message: error.message,
    });
  }
});

/* ===================
   DEBUG ROUTES
   =================== */

app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/links", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });

    res.json({
      totalLinks: links.length,
      links,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/analytics", async (req, res) => {
  try {
    const recentEvents = await Analytics.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      totalEvents: await Analytics.countDocuments(),
      recentEvents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/debug/set-username", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        error: "email and username are required",
      });
    }

    const cleanEmail = safeLowerTrim(email);
    const cleanUsername = safeLowerTrim(username);

    const existingUsername = await User.findOne({
      username: cleanUsername,
      email: { $ne: cleanEmail },
    });

    if (existingUsername) {
      return res.status(400).json({
        error: "Username is already taken",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      { username: cleanUsername },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        error: `No user found with email ${email}`,
      });
    }

    res.json({
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Debug set username error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ===================
   ERROR HANDLING
   =================== */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

/* ===================
   KEEP-ALIVE
   =================== */
const KEEP_ALIVE_URL =
  process.env.NODE_ENV === "production"
    ? "https://linkafrica.onrender.com/health"
    : null;

if (KEEP_ALIVE_URL) {
  setInterval(async () => {
    try {
      const response = await fetch(KEEP_ALIVE_URL);
      console.log(
        `🏓 Keep-alive ping: ${response.status} at ${new Date().toISOString()}`
      );
    } catch (error) {
      console.log("🏓 Keep-alive ping failed:", error.message);
    }
  }, 8 * 60 * 1000);

  console.log("🏓 Keep-alive pinger started - backend will stay awake!");
}

/* ===================
   SERVER START
   =================== */
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 LinkAfrika API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📖 Health check: /health`);
      console.log(`🧪 Test endpoint: /test`);
      console.log(`🔗 API Base: /api`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Server ready! MongoDB backend is now active.");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
