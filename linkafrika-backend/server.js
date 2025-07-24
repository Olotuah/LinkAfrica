import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// File paths for persistent storage
const DATA_DIR = "./data";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LINKS_FILE = path.join(DATA_DIR, "links.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

// Add this after your imports
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://link-africa.vercel.app" // production frontend URL
      : [
          "http://localhost:3000", // React development server URL
          "http://localhost:5173", // Vite development server URL
        ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Replace app.use(cors()); with:
app.use(cors(corsOptions));

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper functions for file operations
const loadData = (filePath, defaultData = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return defaultData;
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    return false;
  }
};

// Load existing data or initialize empty arrays
let users = loadData(USERS_FILE, []);
let links = loadData(LINKS_FILE, []);
let analytics = loadData(ANALYTICS_FILE, []);

console.log(
  `📊 Loaded ${users.length} users, ${links.length} links, ${analytics.length} analytics events`
);

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Simple token validation (in production, use JWT)
  const userId = token.replace("linkafrika-token-", "").split("-")[0];
  const user = users.find((u) => u.id.toString() === userId);

  if (!user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
};

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "LinkAfrika API is running!",
    users: users.length,
    links: links.length,
    analytics: analytics.length,
    timestamp: new Date().toISOString(),
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Hello from LinkAfrika backend!",
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
      "GET /api/analytics/stats",
      "POST /api/analytics/track",
      "GET /api/public/:username",
      "POST /api/public/click/:linkId",
    ],
  });
});

// ===================
// AUTH ROUTES
// ===================

app.post("/api/auth/register", (req, res) => {
  console.log("📝 Register request:", req.body);

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email, and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long",
    });
  }

  // Check for duplicate email
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({
      error: "An account with this email already exists",
    });
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // In production, hash this with bcrypt!
    username: null, // Will be set during onboarding
    displayName: name.trim(),
    bio: "",
    avatarUrl: "",
    theme: "purple",
    isPro: false,
    onboardingCompleted: false,
    profileViews: 0,
    followerCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Save to file
  if (saveData(USERS_FILE, users)) {
    console.log("✅ User data saved to file");
  }

  const token = `linkafrika-token-${newUser.id}-${Date.now()}`;

  console.log("✅ User registered:", newUser.email);

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: "Account created successfully!",
    token,
    user: userWithoutPassword,
  });
});

app.post("/api/auth/login", (req, res) => {
  console.log("🔐 Login request:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(400).json({
      error: "No account found with this email address",
    });
  }

  if (user.password !== password) {
    return res.status(400).json({
      error: "Incorrect password",
    });
  }

  const token = `linkafrika-token-${user.id}-${Date.now()}`;

  console.log("✅ User logged in:", user.email);

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: "Login successful!",
    token,
    user: userWithoutPassword,
  });
});

// Check username availability
app.post("/api/auth/check-username", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      error: "Username is required",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      error: "Username must be at least 3 characters long",
      available: false,
    });
  }

  // Check if username is already taken
  const existingUser = users.find(
    (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
  );

  const isAvailable = !existingUser;

  res.json({
    available: isAvailable,
    message: isAvailable
      ? "Username is available!"
      : "Username is already taken",
  });
});

// Get current user (for auth validation)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({
    user: userWithoutPassword,
  });
});

// ===================
// USER ROUTES
// ===================

// Get user profile
app.get("/api/user/profile", authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Update user profile
app.put("/api/user/profile", authenticateToken, (req, res) => {
  console.log("📝 Profile update request:", req.body);

  const {
    username,
    displayName,
    bio,
    theme,
    avatarUrl,
    onboardingCompleted,
    isPro,
  } = req.body;

  const userIndex = users.findIndex((u) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // If username is being updated, check availability
  if (username && username !== req.user.username) {
    const existingUser = users.find(
      (u) =>
        u.username &&
        u.username.toLowerCase() === username.toLowerCase() &&
        u.id !== req.user.id
    );

    if (existingUser) {
      return res.status(400).json({
        error: "Username is already taken",
      });
    }
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...(username !== undefined && { username: username.toLowerCase() }),
    ...(displayName !== undefined && { displayName: displayName.trim() }),
    ...(bio !== undefined && { bio }),
    ...(theme !== undefined && { theme }),
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(onboardingCompleted !== undefined && { onboardingCompleted }),
    ...(isPro !== undefined && { isPro }),
    updatedAt: new Date().toISOString(),
  };

  // Save to file
  if (saveData(USERS_FILE, users)) {
    console.log("✅ User profile updated");
  }

  const { password: _, ...userWithoutPassword } = users[userIndex];

  res.json({
    message: "Profile updated successfully",
    user: userWithoutPassword,
  });
});

// ===================
// LINKS ROUTES
// ===================

// Get user's links
app.get("/api/links", authenticateToken, (req, res) => {
  const userLinks = links.filter((link) => link.userId === req.user.id);

  // Sort by creation date (newest first)
  userLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  console.log(
    `📋 Retrieved ${userLinks.length} links for user:`,
    req.user.email
  );

  res.json(userLinks);
});

// Create new link
app.post("/api/links", authenticateToken, (req, res) => {
  console.log("🔗 Create link request:", req.body);

  const { title, url, type, description, isActive = true } = req.body;

  if (!title || !url) {
    return res.status(400).json({
      error: "Title and URL are required",
    });
  }

  // Check user's link limit (free users limited to 3)
  const userLinks = links.filter((link) => link.userId === req.user.id);

  if (!req.user.isPro && userLinks.length >= 3) {
    return res.status(400).json({
      error:
        "Free users are limited to 3 links. Upgrade to Pro for unlimited links.",
    });
  }

  const newLink = {
    id: Date.now(),
    userId: req.user.id,
    title: title.trim(),
    url: url.trim(),
    type: type || "social",
    description: description ? description.trim() : "",
    isActive,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  links.push(newLink);

  // Save to file
  if (saveData(LINKS_FILE, links)) {
    console.log("✅ Links data saved to file");
  }

  console.log("✅ Link created:", newLink.title, "for user:", req.user.email);

  res.status(201).json({
    message: "Link created successfully",
    link: newLink,
  });
});

// Update link
app.put("/api/links/:id", authenticateToken, (req, res) => {
  const linkId = parseInt(req.params.id);
  const linkIndex = links.findIndex(
    (link) => link.id === linkId && link.userId === req.user.id
  );

  if (linkIndex === -1) {
    return res.status(404).json({ error: "Link not found" });
  }

  const { title, url, type, description, isActive } = req.body;

  const updatedLink = {
    ...links[linkIndex],
    ...(title !== undefined && { title: title.trim() }),
    ...(url !== undefined && { url: url.trim() }),
    ...(type !== undefined && { type }),
    ...(description !== undefined && { description: description.trim() }),
    ...(isActive !== undefined && { isActive }),
    updatedAt: new Date().toISOString(),
  };

  links[linkIndex] = updatedLink;

  // Save to file
  if (saveData(LINKS_FILE, links)) {
    console.log("✅ Links data saved to file");
  }

  console.log("✅ Link updated:", updatedLink.title);

  res.json({
    message: "Link updated successfully",
    link: updatedLink,
  });
});

// Delete link
app.delete("/api/links/:id", authenticateToken, (req, res) => {
  const linkId = parseInt(req.params.id);
  const linkIndex = links.findIndex(
    (link) => link.id === linkId && link.userId === req.user.id
  );

  if (linkIndex === -1) {
    return res.status(404).json({ error: "Link not found" });
  }

  const deletedLink = links.splice(linkIndex, 1)[0];

  // Save to file
  if (saveData(LINKS_FILE, links)) {
    console.log("✅ Links data saved to file");
  }

  console.log("🗑️ Link deleted:", deletedLink.title);

  res.json({
    message: "Link deleted successfully",
    link: deletedLink,
  });
});

// ===================
// ANALYTICS ROUTES
// ===================

// Get analytics stats
app.get("/api/analytics/stats", authenticateToken, (req, res) => {
  const { days = 30 } = req.query;

  const userLinks = links.filter((link) => link.userId === req.user.id);
  const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalLinks = userLinks.length;
  const activeLinks = userLinks.filter((link) => link.isActive).length;

  // Generate realistic daily stats for the last 7 days
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate more realistic numbers based on actual data
    const baseClicks = Math.floor(totalClicks / 7);
    const variance = Math.floor(Math.random() * (baseClicks + 5));

    dailyStats.push({
      date: date.toISOString().split("T")[0],
      clicks: Math.max(0, baseClicks + variance - 2),
      views: Math.floor((baseClicks + variance) * 1.5),
    });
  }

  const topLink = userLinks.reduce(
    (top, link) => (link.clicks > (top?.clicks || 0) ? link : top),
    null
  );

  const stats = {
    totalClicks,
    totalLinks,
    activeLinks,
    profileViews: req.user.profileViews || Math.floor(totalClicks * 1.2),
    monthlyGrowth: totalClicks > 0 ? Math.floor(Math.random() * 25) + 5 : 0,
    earnings: req.user.isPro ? Math.floor(totalClicks * 0.5) : 0,
    conversionRate:
      totalClicks > 0
        ? ((totalClicks / Math.max(req.user.profileViews, 100)) * 100).toFixed(
            1
          )
        : "0.0",
    topLink: topLink ? topLink.title : "None yet",
    dailyStats,
  };

  console.log(`📊 Generated analytics for user:`, req.user.email);

  res.json(stats);
});

// Track analytics event
app.post("/api/analytics/track", (req, res) => {
  const { event, data } = req.body;

  const analyticsEvent = {
    id: Date.now(),
    event,
    data,
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };

  analytics.push(analyticsEvent);

  // Save to file (but don't block response)
  saveData(ANALYTICS_FILE, analytics);

  console.log("📊 Analytics event tracked:", event);

  res.json({
    message: "Event tracked successfully",
  });
});

// ===================
// PUBLIC ROUTES
// ===================

// Get public profile
app.get("/api/public/:username", (req, res) => {
  const { username } = req.params;

  console.log("🌍 Public profile request for:", username);

  // Look for user by username first, then by email as fallback
  let user = users.find(
    (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
  );

  // If not found by username, try email (for backward compatibility)
  if (!user) {
    user = users.find((u) => u.email.toLowerCase() === username.toLowerCase());
  }

  if (!user) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Get user's active links
  const userLinks = links
    .filter((link) => link.userId === user.id && link.isActive)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Increment profile views
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].profileViews = (users[userIndex].profileViews || 0) + 1;
    saveData(USERS_FILE, users);
  }

  // Public profile data (no sensitive info)
  const publicProfile = {
    id: user.id,
    username: user.username || user.email.split("@")[0],
    displayName: user.displayName || user.name,
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    theme: user.theme || "purple",
    isPro: user.isPro || false,
    profileViews: user.profileViews || 0,
    followerCount: user.followerCount || 0,
    links: userLinks.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      type: link.type,
      description: link.description,
      clicks: link.clicks,
    })),
  };

  console.log("✅ Public profile served for:", user.email);

  res.json(publicProfile);
});

// Track link click
app.post("/api/public/click/:linkId", (req, res) => {
  const linkId = parseInt(req.params.linkId);
  const linkIndex = links.findIndex((link) => link.id === linkId);

  if (linkIndex === -1) {
    return res.status(404).json({ error: "Link not found" });
  }

  // Increment click count
  links[linkIndex].clicks += 1;

  // Save to file
  saveData(LINKS_FILE, links);

  // Track analytics event
  const analyticsEvent = {
    id: Date.now(),
    event: "link_click",
    data: {
      linkId: linkId,
      linkTitle: links[linkIndex].title,
      linkUrl: links[linkIndex].url,
      userId: links[linkIndex].userId,
    },
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };

  analytics.push(analyticsEvent);
  saveData(ANALYTICS_FILE, analytics);

  console.log(
    "📊 Link clicked:",
    links[linkIndex].title,
    "- Total clicks:",
    links[linkIndex].clicks
  );

  res.json({
    message: "Click tracked successfully",
    clicks: links[linkIndex].clicks,
  });
});

// ===================
// DEBUG ROUTES
// ===================

app.get("/api/debug/users", (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      onboardingCompleted: u.onboardingCompleted,
      isPro: u.isPro,
      profileViews: u.profileViews,
      createdAt: u.createdAt,
    })),
  });
});

app.get("/api/debug/links", (req, res) => {
  res.json({
    totalLinks: links.length,
    links: links.map((l) => ({
      id: l.id,
      userId: l.userId,
      title: l.title,
      url: l.url,
      type: l.type,
      clicks: l.clicks,
      isActive: l.isActive,
      createdAt: l.createdAt,
    })),
  });
});

app.get("/api/debug/analytics", (req, res) => {
  res.json({
    totalEvents: analytics.length,
    recentEvents: analytics.slice(-10).map((a) => ({
      id: a.id,
      event: a.event,
      data: a.data,
      timestamp: a.timestamp,
    })),
  });
});

// Clear all data (be careful!)
app.post("/api/debug/clear", (req, res) => {
  const { confirm } = req.body;

  if (confirm !== "CLEAR_ALL_DATA") {
    return res.status(400).json({
      error: "Please send { confirm: 'CLEAR_ALL_DATA' } to clear all data",
    });
  }

  users.length = 0;
  links.length = 0;
  analytics.length = 0;

  saveData(USERS_FILE, users);
  saveData(LINKS_FILE, links);
  saveData(ANALYTICS_FILE, analytics);

  console.log("🗑️ All data cleared!");

  res.json({
    message: "All data cleared successfully",
    timestamp: new Date().toISOString(),
  });
});

// ===================
// ERROR HANDLING
// ===================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /health",
      "GET /test",
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
      "GET /api/analytics/stats",
      "POST /api/analytics/track",
      "GET /api/public/:username",
      "POST /api/public/click/:linkId",
    ],
  });
});

// ===================
// SERVER START
// ===================

app.listen(PORT, () => {
  console.log(`🚀 LinkAfrika API running on http://localhost:${PORT}`);
  console.log(
    `📊 Loaded ${users.length} users, ${links.length} links, ${analytics.length} analytics events`
  );
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🐛 Debug endpoints: http://localhost:${PORT}/api/debug/users`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Server ready! Your Pro features should now work!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
