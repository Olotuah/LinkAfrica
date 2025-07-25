import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { linksAPI, analyticsAPI } from "../utils/api";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Copy,
  ExternalLink,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Instagram,
  Youtube,
  Crown,
  AlertCircle,
  CheckCircle,
  Loader,
  Check,
  Save,
  X,
  BookOpen,
  Headphones,
  Briefcase,
} from "lucide-react";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [userLinks, setUserLinks] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    profileViews: 0,
    monthlyGrowth: 0,
    earnings: 0,
    conversionRate: 0,
    topLink: "None yet",
    totalLinks: 0,
    activeLinks: 0,
  });

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingLink, setEditingLink] = useState(null);

  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    type: "social",
    description: "",
  });

  const [newProduct, setNewProduct] = useState({
    type: "ebook",
    name: "",
    price: "",
    description: "",
    paymentLink: "",
  });

  // FIXED: Create a consistent user key function
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

  // Migration function to move data from old keys to new keys
  const migrateUserData = (user) => {
    if (!user?.email || !user?.id) return;

    const oldKeys = {
      links: `links_${user.id}`,
      products: `products_${user.id}`,
      stats: `stats_${user.id}`,
    };

    const newKeys = {
      links: `links_${user.email}`,
      products: `products_${user.email}`,
      stats: `stats_${user.email}`,
    };

    console.log("🔄 Checking for data migration...");

    Object.keys(oldKeys).forEach(dataType => {
      const oldKey = oldKeys[dataType];
      const newKey = newKeys[dataType];
      
      const oldData = localStorage.getItem(oldKey);
      const newData = localStorage.getItem(newKey);
      
      // If old data exists but new data doesn't, migrate it
      if (oldData && !newData) {
        console.log(`📦 Migrating ${dataType} from ${oldKey} to ${newKey}`);
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(oldKey); // Remove old key
      }
    });
  };
  const debugProductsPersistence = (user) => {
    console.log("🐛 === PRODUCTS DEBUG ===");
    console.log("Current user object:", {
      id: user?.id,
      email: user?.email,
      username: user?.username,
    });

    // Check all possible key variations
    const possibleKeys = [
      `products_${user?.id}`,
      `products_${user?.email}`,
      `products_${user?.id || user?.email}`,
    ];

    console.log("Checking all possible product keys:");
    possibleKeys.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(
          `✅ Found data for key "${key}":`,
          JSON.parse(data).length,
          "products"
        );
      } else {
        console.log(`❌ No data for key "${key}"`);
      }
    });

    // Check ALL localStorage keys for products
    console.log("All localStorage keys:");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("products_")) {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        console.log(`📦 ${key}: ${data.length} products`);
      }
    });

    console.log("🐛 === END DEBUG ===");
  };

  // Generate QR Code
  const generateQRCode = () => {
    const profileUrl = `${window.location.origin}/profile/${
      user?.username || user?.email
    }`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      profileUrl
    )}`;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${user?.username || user?.email}-qr-code.png`;
    link.click();
  };

  // Check for welcome or upgrade flags
  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("welcome");
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }

    if (searchParams.get("upgrade") === "pro") {
      setShowUpgradePrompt(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("upgrade");
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  // FIXED: Load dashboard data with consistent key generation
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("📊 Loading dashboard data for user:", user?.email);
      
      // IMPORTANT: Migrate any old data before loading
      migrateUserData(user);
      
      // Debug the current state
      debugProductsPersistence(user);

      try {
        const [linksResponse, statsResponse] = await Promise.all([
          linksAPI.getLinks(),
          analyticsAPI.getStats(30),
        ]);

        setUserLinks(linksResponse.data);
        setStats({
          ...statsResponse.data,
          totalLinks: linksResponse.data.length,
          activeLinks: linksResponse.data.filter((link) => link.isActive)
            .length,
        });

        // FIXED: Use consistent key generation
        const userProductsKey = getUserKey(user, "products");
        const savedProducts = JSON.parse(
          localStorage.getItem(userProductsKey) || "[]"
        );
        setUserProducts(savedProducts);
        console.log(
          `📦 Products loaded from ${userProductsKey}:`,
          savedProducts.length
        );

      } catch (apiError) {
        console.log("⚠️ API not available, loading from localStorage...");

        // FIXED: Use consistent key generation for all data
        const userLinksKey = getUserKey(user, "links");
        const userProductsKey = getUserKey(user, "products");
        const userStatsKey = getUserKey(user, "stats");

        const savedLinks = JSON.parse(
          localStorage.getItem(userLinksKey) || "[]"
        );
        const savedProducts = JSON.parse(
          localStorage.getItem(userProductsKey) || "[]"
        );
        const savedStats = JSON.parse(
          localStorage.getItem(userStatsKey) || "{}"
        );

        console.log(`📦 Loading data with consistent keys:`);
        console.log(`- Links (${userLinksKey}):`, savedLinks.length);
        console.log(`- Products (${userProductsKey}):`, savedProducts.length);
        console.log(`- Stats (${userStatsKey}):`, savedStats);

        setUserLinks(savedLinks);
        setUserProducts(savedProducts);

        // Calculate and persist stats properly
        const totalClicks = savedLinks.reduce(
          (sum, link) => sum + (link.clicks || 0),
          0
        );
        const profileViews = savedStats.profileViews || 0;

        const updatedStats = {
          totalClicks: totalClicks,
          profileViews: profileViews,
          monthlyGrowth: savedStats.monthlyGrowth || 0,
          earnings: savedStats.earnings || 0,
          conversionRate:
            totalClicks > 0 && profileViews > 0
              ? ((totalClicks / profileViews) * 100).toFixed(1)
              : 0,
          topLink:
            savedLinks.length > 0
              ? savedLinks.reduce(
                  (top, link) =>
                    (link.clicks || 0) > (top.clicks || 0) ? link : top,
                  savedLinks[0]
                ).title
              : "None yet",
          totalLinks: savedLinks.length,
          activeLinks: savedLinks.filter((link) => link.isActive).length,
        };

        // Save updated stats back to localStorage
        localStorage.setItem(
          userStatsKey,
          JSON.stringify({
            profileViews: updatedStats.profileViews,
            monthlyGrowth: updatedStats.monthlyGrowth,
            earnings: updatedStats.earnings,
            lastUpdated: new Date().toISOString(),
          })
        );

        setStats(updatedStats);

        console.log("✅ Dashboard data loaded from localStorage");
        console.log("📊 Final stats:", updatedStats);
        console.log("🛍️ Final products:", savedProducts);
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      setError("Dashboard loaded with limited functionality");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding links
  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      setError("Please fill in title and URL");
      return;
    }

    if (!user?.isPro && userLinks.length >= 3) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      setError("");
      console.log("🔗 Adding new link for user:", user?.email);

      try {
        const response = await linksAPI.createLink(newLink);
        setUserLinks([response.data.link, ...userLinks]);
        console.log("✅ Link created via API");
      } catch (apiError) {
        const newLinkWithId = {
          id: Date.now(),
          ...newLink,
          clicks: 0,
          isActive: true,
          userId: user?.id || user?.email,
          createdAt: new Date().toISOString(),
        };

        const updatedLinks = [newLinkWithId, ...userLinks];
        setUserLinks(updatedLinks);

        // Save to user-specific localStorage key
        const userLinksKey = getUserKey(user, "links");
        localStorage.setItem(userLinksKey, JSON.stringify(updatedLinks));

        console.log(`✅ Link saved locally for user: ${userLinksKey}`);
      }

      setNewLink({ title: "", url: "", type: "social", description: "" });
      setShowAddLinkModal(false);

      // Update stats immediately
      setStats((prev) => ({
        ...prev,
        totalLinks: prev.totalLinks + 1,
        activeLinks: prev.activeLinks + 1,
      }));

      console.log("✅ Link added successfully");
    } catch (error) {
      console.error("❌ Error adding link:", error);
      setError("Failed to add link");
    }
  };

  // FIXED: Handle adding products with consistent key generation
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setError("Please fill in product name and price");
      return;
    }

    try {
      setError("");
      console.log("🛍️ Adding new product for user:", user?.email);

      const productWithId = {
        id: Date.now(),
        ...newProduct,
        userId: user?.id || user?.email,
        createdAt: new Date().toISOString(),
      };

      // FIXED: Use consistent key generation
      const updatedProducts = [productWithId, ...userProducts];
      setUserProducts(updatedProducts);

      const userProductsKey = getUserKey(user, "products");
      localStorage.setItem(userProductsKey, JSON.stringify(updatedProducts));

      // Clear form and close modal
      setNewProduct({
        type: "ebook",
        name: "",
        price: "",
        description: "",
        paymentLink: "",
      });
      setShowAddProductModal(false);

      console.log(`✅ Product added successfully to ${userProductsKey}`);
      console.log(`📦 Total products now: ${updatedProducts.length}`);
      
      // Debug after adding
      debugProductsPersistence(user);
      
    } catch (error) {
      console.error("❌ Error adding product:", error);
      setError("Failed to add product");
    }
  };

  // Handle editing links
  const handleEditLink = (link) => {
    setEditingLink({ ...link });
  };

  const handleSaveEdit = async () => {
    if (!editingLink.title || !editingLink.url) {
      setError("Please fill in title and URL");
      return;
    }

    try {
      setError("");

      try {
        await linksAPI.updateLink(editingLink.id, editingLink);
      } catch (apiError) {
        console.log("API not available, updating locally");
      }

      // Update links in state
      const updatedLinks = userLinks.map((link) =>
        link.id === editingLink.id ? editingLink : link
      );
      setUserLinks(updatedLinks);

      // Save to localStorage
      const userLinksKey = getUserKey(user, "links");
      localStorage.setItem(userLinksKey, JSON.stringify(updatedLinks));

      setEditingLink(null);
      console.log("✅ Link updated successfully");
    } catch (error) {
      console.error("❌ Error updating link:", error);
      setError("Failed to update link");
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
  };

  const handleDeleteLink = async (id) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      try {
        await linksAPI.deleteLink(id);
      } catch (apiError) {
        console.log("API not available, deleting locally");
      }

      const updatedLinks = userLinks.filter((link) => link.id !== id);
      setUserLinks(updatedLinks);

      // Save to localStorage after deletion
      const userLinksKey = getUserKey(user, "links");
      localStorage.setItem(userLinksKey, JSON.stringify(updatedLinks));

      setStats((prev) => ({
        ...prev,
        totalLinks: prev.totalLinks - 1,
        activeLinks:
          prev.activeLinks -
          (userLinks.find((l) => l.id === id)?.isActive ? 1 : 0),
      }));

      console.log("✅ Link deleted and saved to localStorage");
    } catch (error) {
      console.error("Error deleting link:", error);
      setError("Failed to delete link");
    }
  };

  // FIXED: Handle deleting products with consistent key generation
  const handleDeleteProduct = (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const updatedProducts = userProducts.filter(
        (product) => product.id !== id
      );
      setUserProducts(updatedProducts);

      const userProductsKey = getUserKey(user, "products");
      localStorage.setItem(userProductsKey, JSON.stringify(updatedProducts));

      console.log("✅ Product deleted successfully");
      console.log(`📦 Remaining products: ${updatedProducts.length}`);
      
      // Debug after deleting
      debugProductsPersistence(user);
      
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  const toggleLinkStatus = async (id) => {
    try {
      const link = userLinks.find((l) => l.id === id);
      const updatedStatus = !link.isActive;

      try {
        await linksAPI.updateLink(id, { isActive: updatedStatus });
      } catch (apiError) {
        console.log("API not available, updating locally");
      }

      const updatedLinks = userLinks.map((link) =>
        link.id === id ? { ...link, isActive: updatedStatus } : link
      );
      setUserLinks(updatedLinks);

      // Save to localStorage
      const userLinksKey = getUserKey(user, "links");
      localStorage.setItem(userLinksKey, JSON.stringify(updatedLinks));

      setStats((prev) => ({
        ...prev,
        activeLinks: updatedStatus
          ? prev.activeLinks + 1
          : prev.activeLinks - 1,
      }));
    } catch (error) {
      console.error("Error updating link:", error);
      setError("Failed to update link");
    }
  };

  const copyProfileUrl = () => {
    const profileUrl = `${window.location.origin}/profile/${
      user?.username || user?.email || "yourprofile"
    }`;
    navigator.clipboard.writeText(profileUrl);

    const button = event.target.closest("button");
    const originalText = button.innerHTML;
    button.innerHTML =
      '<span class="flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><span>Copied!</span></span>';
    button.className = button.className.replace(
      "bg-purple-600",
      "bg-green-600"
    );

    setTimeout(() => {
      button.innerHTML = originalText;
      button.className = button.className.replace(
        "bg-green-600",
        "bg-purple-600"
      );
    }, 2000);
  };

  // Debug Products Button (temporary)
  const DebugProductsButton = () => (
    <button
      onClick={() => debugProductsPersistence(user)}
      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 ml-2"
    >
      Debug Products
    </button>
  );

  const linkTypeIcons = {
    social: <Instagram className="w-4 h-4" />,
    whatsapp: <MessageCircle className="w-4 h-4" />,
    product: <DollarSign className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
  };

  const productTypeIcons = {
    ebook: <BookOpen className="w-5 h-5" />,
    course: <Headphones className="w-5 h-5" />,
    service: <Briefcase className="w-5 h-5" />,
    template: <Globe className="w-5 h-5" />,
    other: <DollarSign className="w-5 h-5" />,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to LinkAfrika! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is ready! You can now start adding links and sharing
              your profile.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowWelcome(false);
                  window.open(
                    `/profile/${user?.username || user?.email || "demo"}`,
                    "_blank"
                  );
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-green-600 text-white py-3 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-colors"
              >
                View My Profile
              </button>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upgrade to Pro
              </h2>
              <p className="text-gray-600 mb-6">
                You've reached the limit of 3 links. Upgrade to Pro for
                unlimited links, analytics, and more features.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowUpgradePrompt(false);
                    navigate("/pricing");
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-green-600 text-white py-3 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-colors"
                >
                  Upgrade Now - ₦3,000/month
                </button>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* User Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name || user?.email || "User"}! 👋
              </h1>
              <p className="opacity-90">
                Manage your links and grow your online presence
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm opacity-75">Your Profile</div>
              <div className="font-medium">
                {window.location.host}/profile/
                {user?.username || user?.email || "yourprofile"}
              </div>
            </div>
          </div>
        </div>

        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.profileViews.toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Link Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClicks.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLinks}
                </p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeLinks}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Profile URL Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your LinkAfrika URL
          </h2>
          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-gray-700 font-medium">
              linkafrika.com/profile/
              {user?.username || user?.email || "yourprofile"}
            </span>
            <button
              onClick={copyProfileUrl}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => {
                const username = user?.username || user?.email;
                if (!username) {
                  navigate("/onboarding");
                } else {
                  window.open(`/profile/${username}`, "_blank");
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Links Management */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Manage Links
              </h2>
              <p className="text-sm text-gray-500">
                {user?.isPro
                  ? "Unlimited links"
                  : `${userLinks.length}/3 links used`}
              </p>
            </div>
            <button
              onClick={() => setShowAddLinkModal(true)}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </button>
          </div>

          {userLinks.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No links yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first link to get started!
              </p>
              <button
                onClick={() => setShowAddLinkModal(true)}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Your First Link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  {editingLink && editingLink.id === link.id ? (
                    // EDIT MODE
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={editingLink.title}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            title: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Link title"
                      />
                      <input
                        type="url"
                        value={editingLink.url}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            url: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="https://..."
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <>
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 text-gray-400">
                            {linkTypeIcons[link.type] || (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-gray-600 text-sm">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {link.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {link.url}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{link.clicks || 0} clicks</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              link.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {link.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleLinkStatus(link.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title={link.isActive ? "Disable link" : "Enable link"}
                        >
                          {link.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditLink(link)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit link"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() =>
              window.open(
                `/profile/${user?.username || user?.email || "demo"}`,
                "_blank"
              )
            }
            className="bg-white rounded-xl shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
          >
            <ExternalLink className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View Profile</h3>
            <p className="text-gray-600 text-sm">
              See how your profile looks to visitors
            </p>
          </button>

          <button
            onClick={generateQRCode}
            className="bg-white rounded-xl shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm14 8V3h-8v8h8zm-6-6h4v4h-4V5zm-8 14h8v-8H3v8zm2-6h4v4H5v-4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Generate QR Code
            </h3>
            <p className="text-gray-600 text-sm">
              Download QR code for your profile
            </p>
          </button>
          
          <button
            onClick={() => navigate("/analytics")}
            className="bg-white rounded-xl shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
          >
            <BarChart3 className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              Track your link performance and engagement
            </p>
          </button>
        </div>

        {/* Product Selling Section for Pro Users */}
        {user?.isPro && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Digital Products & Services
                </h2>
                <p className="text-sm text-gray-500">
                  Monetize your audience with e-books, courses, and services
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <DebugProductsButton />
              </div>
            </div>

            <div className="space-y-4">
              {userProducts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Products Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start selling digital products to monetize your audience
                  </p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                userProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        {productTypeIcons[product.type]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ₦{parseInt(product.price).toLocaleString()} •{" "}
                          {product.type}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (product.paymentLink) {
                            window.open(product.paymentLink, "_blank");
                          } else {
                            alert("No payment link set for this product");
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View payment link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pro Features Preview for Free Users */}
        {!user?.isPro && (
          <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Unlock Pro Features 🚀
                </h2>
                <p className="opacity-90 mb-4">
                  Sell digital products, get advanced analytics, and remove
                  limits
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Unlimited links</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Sell digital products</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Custom branding</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Upgrade Now</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Digital Product
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={newProduct.type}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ebook">E-book / PDF</option>
                  <option value="course">Online Course</option>
                  <option value="service">Service / Consulting</option>
                  <option value="template">Template</option>
                  <option value="other">Other Digital Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="e.g. Social Media Marketing Guide"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  placeholder="5000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your product..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Link (Paystack/Flutterwave)
                </label>
                <input
                  type="url"
                  value={newProduct.paymentLink}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      paymentLink: e.target.value,
                    })
                  }
                  placeholder="https://paystack.com/pay/your-payment-link"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Link
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Title *
                </label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                  placeholder="e.g. My Instagram"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                  placeholder="https://instagram.com/yourusername"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newLink.type}
                  onChange={(e) =>
                    setNewLink({ ...newLink, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="social">Social Media</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="product">Product/Service</option>
                  <option value="youtube">YouTube</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) =>
                    setNewLink({ ...newLink, description: e.target.value })
                  }
                  placeholder="Brief description"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;