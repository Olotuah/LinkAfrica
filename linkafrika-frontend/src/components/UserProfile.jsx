import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnalyticsTracker from "../utils/analytics";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload";
import { userAPI } from "../utils/api";
import KemiCreatesProfile from "./KemiCreatesProfile";
import NelsonCreatesProfile from "./NelsonCreatesProfile";
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
  Briefcase,
  X,
  Image as ImageIcon,
  Camera,
  Loader,
} from "lucide-react";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const [user, setUser] = useState(null);
  const [userLinks, setUserLinks] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (username === "kemicretes") {
    return <KemiCreatesProfile />;
  }

  if (username === "nelsoncretes") {
    return <NelsonCreatesProfile />;
  }

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Fetching public profile for:", username);

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://linkafrica.onrender.com/api";

      const res = await fetch(`${API_BASE_URL}/public/${username}`);

      console.log("🌍 /public response status:", res.status);

      if (!res.ok) {
        if (res.status === 404) {
          setError("Profile not found");
          return;
        }
        throw new Error(`Failed to load profile, status ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Public profile data:", data);

      const publicUser = {
        id: data.id || data._id,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl || "",
        theme: data.theme || "purple",
        isPro: data.isPro,
        profileViews: data.profileViews,
        followerCount: data.followerCount,
        email: data.email || "",
      };

      const links = Array.isArray(data.links)
        ? data.links.map((l) => ({
            ...l,
            id: l.id || l._id,
            isActive: l.isActive ?? true,
          }))
        : [];

      const products = Array.isArray(data.products)
        ? data.products.map((p) => ({
            ...p,
            id: p.id || p._id,
            imageUrl: p.imageUrl || "",
          }))
        : [];

      setUser(publicUser);
      setUserLinks(links);
      setUserProducts(products);

      console.log(
        `✅ Profile loaded successfully for ${username} with ${links.length} links and ${products.length} products`
      );
    } catch (err) {
      console.error("❌ Error loading user profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);
      setError("");

      console.log("📤 Uploading profile picture...");

      const uploaded = await uploadImageToCloudinary(
        file,
        "linkafrika/profile-pictures"
      );

      const avatarUrl = uploaded.secure_url;

      const response = await userAPI.updateProfile({ avatarUrl });
      const updatedUser = response.data?.user || response.data;

      console.log("✅ Avatar updated:", updatedUser);

      setUser((prev) => ({
        ...prev,
        avatarUrl,
      }));

      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      } else if (updateUser) {
        updateUser({ avatarUrl });
      }
    } catch (err) {
      console.error("❌ Avatar upload failed:", err);
      setError(err?.response?.data?.message || "Failed to upload profile image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLinkClick = async (link) => {
    try {
      console.log(
        `🔗 Link clicked: ${link.title} by user: ${
          user?.email || user?.username || user?.id
        }`
      );

      AnalyticsTracker.trackLinkClick(
        link.id,
        link.title,
        link.url,
        user?.id || user?.email || user?.username
      );

      const updatedLinks = userLinks.map((l) =>
        l.id === link.id ? { ...l, clicks: (l.clicks || 0) + 1 } : l
      );
      setUserLinks(updatedLinks);

      window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("❌ Error tracking click:", err);
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (user && !loading && !error) {
      AnalyticsTracker.trackProfileView(
        user?.id || user?.email || user?.username,
        "direct"
      );
    }
  }, [user, loading, error]);

  const handleProductClick = (product) => {
    console.log(`🛍️ Product clicked: ${product.name}`);
    if (product.paymentLink) {
      window.open(product.paymentLink, "_blank", "noopener,noreferrer");
    } else {
      alert("Payment link not available for this product");
    }
  };

  const openImagePreview = (imageUrl, title) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title || "Product image");
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setPreviewTitle("");
  };

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user.displayName || user.username} - LinkAfrika`,
          text:
            user.bio ||
            `Check out ${user.displayName || user.username}'s links and products`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied to clipboard!");
      }
    } catch (err) {
      console.error("❌ Share failed:", err);
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

  const isOwnProfile =
    currentUser &&
    ((currentUser.username &&
      user?.username &&
      currentUser.username.toLowerCase() === user.username.toLowerCase()) ||
      (currentUser.email &&
        user?.email &&
        currentUser.email.toLowerCase() === user.email.toLowerCase()));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeBackground}`}>
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
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
            )}

            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-800 transition">
                {uploadingAvatar ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.displayName || username}
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

        {userProducts.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                Digital Products & Services
              </h2>
            </div>

            <div className="mb-8 space-y-3">
              {userProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        product.imageUrl &&
                        openImagePreview(product.imageUrl, product.name)
                      }
                      className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border hover:opacity-90 transition"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                          <ImageIcon className="w-6 h-6 text-green-500" />
                        </div>
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-600 font-bold text-lg">
                              ₦{parseInt(product.price || 0, 10).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 capitalize">
                              {product.type}
                            </span>
                          </div>
                        </div>

                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getProductTypeIcon(product.type)}
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Tap to open product
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {userLinks.length > 0 ? (
          <div className="space-y-3 mb-8">
            {userLinks.map((link, index) => (
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

        {!isOwnProfile && (
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
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900 truncate">
                {previewTitle}
              </h3>
              <button
                onClick={closeImagePreview}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="bg-gray-50 flex items-center justify-center p-4">
              <img
                src={previewImage}
                alt={previewTitle}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
