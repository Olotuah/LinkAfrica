import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AnalyticsTracker from "../utils/analytics";
import KemiCreatesProfile from "./NelsonCreatesProfile";
import NelsonCreatesProfile from "./NelsonCreatesProfile"; // Import the Nelson profile
import {
  ExternalLink,
  Instagram,
  Youtube,
  MessageCircle,
  Globe,
  DollarSign,
  BookOpen,
  Headphones,
  Users,
  Eye,
  ArrowLeft,
  Share,
  Heart,
  Briefcase,
} from "lucide-react";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLinks, setUserLinks] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Handle special demo profiles
  if (username === "kemicretes") {
    return <KemiCreatesProfile />;
  }

  // Add Nelson Creates demo profile
  if (username === "nelsoncretes") {
    return <NelsonCreatesProfile />;
  }

  // FIXED: Consistent key generation function (matches Dashboard)
  const getUserKey = (user, prefix = "") => {
    // ALWAYS use email as the primary identifier for consistency
    // Never use ID to avoid key mismatches
    const identifier = user?.email;

    if (!identifier) {
      console.error("❌ No email found for user key generation:", user);
      return null;
    }

    const key = prefix ? `${prefix}_${identifier}` : identifier;

    console.log(`🔑 Generated key: "${key}" from user email: ${user?.email}`);

    return key;
  };

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Looking for profile with username:", username);

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      console.log(
        "📋 Available users:",
        users.map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          onboardingCompleted: u.onboardingCompleted,
        }))
      );

      const foundUser = users.find(
        (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
      );

      if (foundUser) {
        console.log(
          "✅ User found:",
          foundUser.email,
          "with username:",
          foundUser.username
        );
        setUser(foundUser);

        // FIXED: Use consistent key generation for links
        const userLinksKey = getUserKey(foundUser, "links");
        const userLinksData = JSON.parse(
          localStorage.getItem(userLinksKey) || "[]"
        );

        console.log(
          `📦 Loading profile links for ${userLinksKey}:`,
          userLinksData
        );
        setUserLinks(userLinksData.filter((link) => link.isActive));

        // FIXED: Use consistent key generation for products
        const userProductsKey = getUserKey(foundUser, "products");
        const products = JSON.parse(
          localStorage.getItem(userProductsKey) || "[]"
        );
        setUserProducts(products);

        console.log(
          `📦 Loading products for ${userProductsKey}:`,
          products.length,
          "products"
        );
        console.log("🛍️ Products data:", products);

        console.log(`✅ Profile loaded successfully for ${username}`);
      } else {
        console.error(`❌ No user found with username: ${username}`);
        console.log(
          "🔍 Searched for username (case-insensitive):",
          username.toLowerCase()
        );
        console.log(
          "📋 Available usernames:",
          users.map((u) => u.username).filter(Boolean)
        );
        setError("Profile not found");
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // UNIVERSAL LINKS LOADER - Add this function to Analytics.jsx

  const loadUserLinks = (user) => {
    console.log("🔍 Searching for user links...");

    // All possible key variations we might have used
    const possibleKeys = [
      `links_${user?.email}`,
      `links_${user?.id}`,
      `links_${user?.id || user?.email}`,
      `links_${user?.email || user?.id}`,
    ];

    // Remove duplicates and undefined keys
    const uniqueKeys = [...new Set(possibleKeys)].filter(
      (key) => key && key !== "links_undefined" && key !== "links_null"
    );

    console.log("🔑 Checking keys:", uniqueKeys);

    for (const key of uniqueKeys) {
      const data = localStorage.getItem(key);
      if (data && data !== "[]") {
        try {
          const links = JSON.parse(data);
          if (links.length > 0) {
            console.log(`✅ Found ${links.length} links with key: ${key}`);
            return links;
          }
        } catch (error) {
          console.log(`❌ Error parsing data for key ${key}:`, error);
        }
      }
    }

    console.log("❌ No links found for any key variation");
    return [];
  };

  // REPLACE your loadAnalytics function with this BULLETPROOF version:

  // In Analytics.jsx - REPLACE the loadAnalytics function with this FIXED version:

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      console.log("📊 Loading analytics for user:", user?.email);

      // Get analytics data
      const analytics = await AnalyticsTracker.getAnalyticsData(
        user?.id || user?.email,
        parseInt(timeRange)
      );

      // FIXED: Load links using the same key format as Dashboard
      const userLinksKey = `links_${user?.email}`; // Use email consistently
      const savedLinks = JSON.parse(localStorage.getItem(userLinksKey) || "[]");

      console.log(
        `📦 Loading links from ${userLinksKey}:`,
        savedLinks.length,
        "links found"
      );
      console.log("🔗 Links data:", savedLinks);

      // If no links found with email, try with ID as fallback
      if (savedLinks.length === 0 && user?.id) {
        const fallbackKey = `links_${user.id}`;
        const fallbackLinks = JSON.parse(
          localStorage.getItem(fallbackKey) || "[]"
        );
        console.log(
          `📦 Fallback: Loading links from ${fallbackKey}:`,
          fallbackLinks.length,
          "links found"
        );

        if (fallbackLinks.length > 0) {
          setLinks(fallbackLinks);
        } else {
          setLinks([]);
        }
      } else {
        setLinks(savedLinks);
      }

      // Update analytics stats with actual link counts
      const updatedAnalytics = {
        ...analytics,
        totalLinks: savedLinks.length,
        activeLinks: savedLinks.filter((link) => link.isActive).length,
      };

      setStats(updatedAnalytics);

      console.log("✅ Analytics loaded successfully");
      console.log("📊 Final analytics:", updatedAnalytics);
      console.log("🔗 Final links:", savedLinks.length);
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
      setStats(AnalyticsTracker.getEmptyAnalytics());
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ADD THIS DEBUG BUTTON to your Analytics.jsx (temporarily for debugging)

  const DebugLinksButton = () => (
    <button
      onClick={() => {
        console.log("🐛 === LINKS DEBUG ===");
        console.log("Current user:", {
          id: user?.id,
          email: user?.email,
          username: user?.username,
        });

        // Check all possible link keys
        const possibleKeys = [
          `links_${user?.email}`,
          `links_${user?.id}`,
          `links_${user?.id || user?.email}`,
          `links_${user?.email || user?.id}`,
        ];

        console.log("Checking all possible link keys:");
        possibleKeys.forEach((key) => {
          const data = localStorage.getItem(key);
          if (data) {
            const links = JSON.parse(data);
            console.log(
              `✅ Found links for key "${key}":`,
              links.length,
              "links"
            );
            console.log("Links preview:", links.slice(0, 2));
          } else {
            console.log(`❌ No data for key "${key}"`);
          }
        });

        // Check current state
        console.log("Current links state:", links);
        console.log("Current stats state:", stats);

        // Check ALL localStorage keys
        console.log('ALL localStorage keys with "links":');
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("links")) {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            console.log(`📦 ${key}: ${data.length} items`);
          }
        });

        console.log("🐛 === END DEBUG ===");
      }}
      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
    >
      Debug Links
    </button>
  );

  // Add this button next to your Export and Share buttons in the header:
  // <DebugLinksButton />

  const handleLinkClick = async (link) => {
    try {
      console.log(
        `🔗 Link clicked: ${link.title} by user: ${user.email || user.username}`
      );

      // TRACK THE CLICK IN ANALYTICS - NEW ANALYTICS TRACKING
      AnalyticsTracker.trackLinkClick(
        link.id,
        link.title,
        link.url,
        user?.id || user?.email
      );

      // Update click count in the displayed links
      const updatedLinks = userLinks.map((l) =>
        l.id === link.id ? { ...l, clicks: (l.clicks || 0) + 1 } : l
      );
      setUserLinks(updatedLinks);

      // Save to localStorage using consistent key generation
      const userLinksKey = getUserKey(user, "links");
      const allUserLinks = JSON.parse(
        localStorage.getItem(userLinksKey) || "[]"
      );
      const updatedAllLinks = allUserLinks.map((l) =>
        l.id === link.id ? { ...l, clicks: (l.clicks || 0) + 1 } : l
      );
      localStorage.setItem(userLinksKey, JSON.stringify(updatedAllLinks));

      // Update user's stats using consistent key generation
      const userStatsKey = getUserKey(user, "stats");
      const currentStats = JSON.parse(
        localStorage.getItem(userStatsKey) || "{}"
      );
      const updatedStats = {
        ...currentStats,
        totalClicks: (currentStats.totalClicks || 0) + 1,
        lastClickDate: new Date().toISOString(),
      };
      localStorage.setItem(userStatsKey, JSON.stringify(updatedStats));

      console.log(
        `✅ Click tracked: ${link.title} now has ${
          (link.clicks || 0) + 1
        } clicks`
      );
      console.log(`📊 User total clicks now: ${updatedStats.totalClicks}`);

      // Open link
      window.open(link.url, "_blank");
    } catch (error) {
      console.error("❌ Error tracking click:", error);
      window.open(link.url, "_blank");
    }
  };

  // Add profile view tracking when someone visits the profile
  useEffect(() => {
    if (user && !loading && !error) {
      // TRACK PROFILE VIEW IN ANALYTICS - NEW ANALYTICS TRACKING
      AnalyticsTracker.trackProfileView(user?.id || user?.email, "direct");

      // Also update the old stats system for backward compatibility
      const userStatsKey = getUserKey(user, "stats");
      const currentStats = JSON.parse(
        localStorage.getItem(userStatsKey) || "{}"
      );
      const updatedStats = {
        ...currentStats,
        profileViews: (currentStats.profileViews || 0) + 1,
        lastViewDate: new Date().toISOString(),
      };
      localStorage.setItem(userStatsKey, JSON.stringify(updatedStats));

      console.log(
        `👁️ Profile view tracked for ${username}: ${updatedStats.profileViews} total views`
      );
    }
  }, [user, loading, error, username]);

  const handleProductClick = (product) => {
    console.log(`Product clicked: ${product.name}`);
    if (product.paymentLink) {
      window.open(product.paymentLink, "_blank");
    } else {
      alert("Payment link not available for this product");
    }
  };

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;

    if (navigator.share) {
      navigator.share({
        title: `${user.displayName || user.name} - LinkAfrika`,
        text: user.bio || `Check out ${user.displayName || user.name}'s links`,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    }
  };

  const getThemeGradient = (theme) => {
    const themes = {
      purple: "from-purple-500 to-pink-500",
      blue: "from-blue-500 to-cyan-500",
      orange: "from-orange-500 to-red-500",
      green: "from-green-500 to-emerald-500",
    };
    return themes[theme] || themes.purple;
  };

  const getThemeBackground = (theme) => {
    const backgrounds = {
      purple: "from-purple-100 via-pink-50 to-purple-100",
      blue: "from-blue-100 via-cyan-50 to-blue-100",
      orange: "from-orange-100 via-red-50 to-orange-100",
      green: "from-green-100 via-emerald-50 to-green-100",
    };
    return backgrounds[theme] || backgrounds.purple;
  };

  const getLinkTypeIcon = (type) => {
    const icons = {
      social: <Instagram className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
      whatsapp: <MessageCircle className="w-5 h-5" />,
      website: <Globe className="w-5 h-5" />,
      product: <DollarSign className="w-5 h-5" />,
      service: <Users className="w-5 h-5" />,
    };
    return icons[type] || <Globe className="w-5 h-5" />;
  };

  const getLinkColor = (type, index) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-pink-500 to-rose-500",
    ];
    return colors[index % colors.length];
  };

  // FIXED: Add product type icons (matches Dashboard)
  const getProductTypeIcon = (type) => {
    const icons = {
      ebook: <BookOpen className="w-5 h-5 text-green-600" />,
      course: <Headphones className="w-5 h-5 text-green-600" />,
      service: <Briefcase className="w-5 h-5 text-green-600" />,
      template: <Globe className="w-5 h-5 text-green-600" />,
      other: <DollarSign className="w-5 h-5 text-green-600" />,
    };
    return icons[type] || <DollarSign className="w-5 h-5 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find a profile with username "{username}".
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const themeGradient = getThemeGradient(user.theme);
  const themeBackground = getThemeBackground(user.theme);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeBackground}`}>
      {/* Header Actions */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={shareProfile}
              className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
              title="Share profile"
            >
              <Share className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{user.profileViews || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div
            className={`w-24 h-24 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
          >
            <span className="text-white text-2xl font-bold">
              {(user.displayName || user.name || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.displayName || user.name || username}
          </h1>

          {user.bio && (
            <p className="text-gray-600 mb-4 leading-relaxed">{user.bio}</p>
          )}

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>Nigeria</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔗</span>
              <span>{userLinks.length} links</span>
            </div>
            {userProducts.length > 0 && (
              <div className="flex items-center space-x-1">
                <span>🛍️</span>
                <span>{userProducts.length} products</span>
              </div>
            )}
          </div>
        </div>

        {/* Products Section - FIXED: Now properly displays products */}
        {userProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-green-500 mr-2" />
              Digital Products & Services
            </h2>
            <div className="space-y-3">
              {userProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {getProductTypeIcon(product.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ₦{parseInt(product.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 capitalize">
                          {product.type}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        {userLinks.length > 0 ? (
          <div className="space-y-3 mb-8">
            {userLinks
              .filter((link) => link.isActive)
              .map((link, index) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className={`w-full p-4 bg-gradient-to-r ${getLinkColor(
                    link.type,
                    index
                  )} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      {getLinkTypeIcon(link.type)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{link.title}</div>
                      <div className="text-sm opacity-75">
                        {link.clicks || 0} clicks
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Links Yet
            </h3>
            <p className="text-gray-600 mb-6">
              This user hasn't added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center pt-8 border-t border-white/30">
          <p className="text-gray-500 text-sm mb-4">
            Create your own link-in-bio page
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create Your LinkAfrika Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
