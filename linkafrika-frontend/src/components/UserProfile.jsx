import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ ADDED
import AnalyticsTracker from "../utils/analytics";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload"; // ✅ ADDED
import { userAPI } from "../utils/api"; // ✅ ADDED
import KemiCreatesProfile from "./NelsonCreatesProfile";
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
} from "lucide-react";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // ✅ ADDED

  const [user, setUser] = useState(null);
  const [userLinks, setUserLinks] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // ✅ KEEP YOUR ORIGINAL NAMES
  if (username === "kemicretes") {
    return <KemiCreatesProfile />;
  }

  if (username === "nelsoncretes") {
    return <NelsonCreatesProfile />;
  }

  // ✅ NEW OWNER LOGIC
  const isOwner =
    currentUser &&
    user &&
    (currentUser.username === user.username ||
      currentUser.email === user.email);

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://linkafrica.onrender.com/api";

      const res = await fetch(`${API_BASE_URL}/public/${username}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError("Profile not found");
          return;
        }
        throw new Error(`Failed to load profile`);
      }

      const data = await res.json();

      const publicUser = {
        id: data.id,
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

      setUser(publicUser);
      setUserLinks(data.links || []);
      setUserProducts(data.products || []);
    } catch (err) {
      console.error("❌ Error loading user profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW FUNCTION (CORRECT POSITION)
  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const uploaded = await uploadImageToCloudinary(
        file,
        "linkafrika/profile-pictures"
      );

      const avatarUrl = uploaded.secure_url;

      const res = await userAPI.updateProfile({ avatarUrl });

      const updatedUser = res.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      console.log("✅ Avatar updated");
    } catch (error) {
      console.error("❌ Upload failed:", error);
    }
  };

  const handleLinkClick = async (link) => {
    try {
      AnalyticsTracker.trackLinkClick(
        link.id,
        link.title,
        link.url,
        user?.id || user?.email || user?.username
      );

      window.open(link.url, "_blank");
    } catch (err) {
      window.open(link.url, "_blank");
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
    if (product.paymentLink) {
      window.open(product.paymentLink, "_blank");
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

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    navigator.clipboard.writeText(profileUrl);
    alert("Profile link copied!");
  };

  const themeGradient = "from-purple-500 to-pink-500";
  const themeBackground = "from-purple-100 via-pink-50 to-purple-100";

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error || !user) return <div>{error}</div>;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeBackground}`}>
      <div className="max-w-lg mx-auto px-4 py-8 text-center">

        {/* ✅ UPDATED AVATAR SECTION */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
            />
          ) : (
            <div className={`w-24 h-24 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold">
                {(user.displayName || user.username || "U")[0]}
              </span>
            </div>
          )}

          {/* ✅ OWNER ONLY BUTTON */}
          {isOwner && (
            <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer">
              📷
              <input
                type="file"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          )}
        </div>

        <h1>{user.displayName}</h1>
      </div>
    </div>
  );
};

export default UserProfile;
