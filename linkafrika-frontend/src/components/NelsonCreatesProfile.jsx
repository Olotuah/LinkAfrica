import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Star,
  ArrowLeft,
  Share,
  Heart,
} from "lucide-react";

// Real Nelson Creates data - this would normally come from database
const nelsonData = {
  id: "nelson-creates",
  username: "nelsoncretes",
  displayName: "Nelson Creates",
  bio: "Digital Marketing Expert 📱 | Content Creator 🎨 | Helping businesses grow online 🚀",
  theme: "purple",
  isPro: true,
  onboardingCompleted: true,
  profileViews: 2847,
  totalClicks: 1256,
  avatar: "NC",
  location: "Lagos, Nigeria",
  joined: "2024-01-15",

  links: [
    {
      id: 1,
      title: "Instagram - @nelsoncretes",
      url: "https://instagram.com/nelsoncretes",
      type: "social",
      icon: <Instagram className="w-5 h-5" />,
      clicks: 432,
      isActive: true,
      color: "from-pink-500 to-purple-500",
    },
    {
      id: 2,
      title: "YouTube Channel",
      url: "https://youtube.com/@nelsoncretes",
      type: "youtube",
      icon: <Youtube className="w-5 h-5" />,
      clicks: 287,
      isActive: true,
      color: "from-red-500 to-red-600",
    },
    {
      id: 3,
      title: "WhatsApp Business",
      url: "https://wa.me/2348123456789",
      type: "whatsapp",
      icon: <MessageCircle className="w-5 h-5" />,
      clicks: 198,
      isActive: true,
      color: "from-green-500 to-green-600",
    },
    {
      id: 4,
      title: "Portfolio Website",
      url: "https://nelsoncretes.com",
      type: "website",
      icon: <Globe className="w-5 h-5" />,
      clicks: 156,
      isActive: true,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 5,
      title: "1-on-1 Consulting",
      url: "https://calendly.com/nelsoncretes",
      type: "service",
      icon: <Users className="w-5 h-5" />,
      clicks: 89,
      isActive: true,
      color: "from-purple-500 to-pink-500",
    },
  ],

  products: [
    {
      id: 1,
      type: "ebook",
      name: "Social Media Marketing Mastery",
      price: 15000,
      description:
        "Complete guide to growing your business on social media with proven strategies and templates.",
      paymentLink: "https://paystack.com/pay/social-media-mastery",
      image: "📱",
      sales: 127,
      rating: 4.9,
      featured: true,
    },
    {
      id: 2,
      type: "course",
      name: "Content Creation Bootcamp",
      price: 45000,
      description:
        "6-week intensive program to master content creation for brands and personal use.",
      paymentLink: "https://paystack.com/pay/content-bootcamp",
      image: "🎨",
      sales: 89,
      rating: 4.8,
      featured: true,
    },
    {
      id: 3,
      type: "service",
      name: "Brand Strategy Session",
      price: 25000,
      description:
        "90-minute deep-dive session to create your brand strategy and content plan.",
      paymentLink: "https://calendly.com/nelsoncretes/brand-strategy",
      image: "🚀",
      sales: 156,
      rating: 5.0,
      featured: false,
    },
  ],
};

const NelsonCreatesProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Simulate loading real user data
    setTimeout(() => {
      if (username === "nelsoncretes") {
        setUser(nelsonData);
      } else {
        // For other usernames, you'd fetch from your API
        setUser(null);
      }
      setLoading(false);
    }, 500);

    // Track profile view
    if (username === "nelsoncretes") {
      // In a real app, you'd make an API call to increment view count
      console.log("Profile view tracked for Nelson Creates");
    }
  }, [username]);

  const handleLinkClick = async (link) => {
    try {
      // Track click in real app
      console.log(`Link clicked: ${link.title}`);

      // Update click count locally (in real app, this would be an API call)
      setUser((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l
        ),
      }));

      // Open link
      window.open(link.url, "_blank");
    } catch (error) {
      console.error("Error tracking click:", error);
      // Still open the link even if tracking fails
      window.open(link.url, "_blank");
    }
  };

  const handleProductClick = (product) => {
    console.log(`Product clicked: ${product.name}`);
    window.open(product.paymentLink, "_blank");
  };

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;

    if (navigator.share) {
      navigator.share({
        title: `${user.displayName} - LinkAfrika`,
        text: user.bio,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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

  const themeGradient = "from-purple-500 to-pink-500"; // Nelson's theme

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100">
      {/* Header Actions */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-purple-100 z-40">
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
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              title="Share profile"
            >
              <Share className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{user.profileViews.toLocaleString()}</span>
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
            <span className="text-white text-2xl font-bold">{user.avatar}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.displayName}
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{user.bio}</p>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{user.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>
                Joined{" "}
                {new Date(user.joined).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">
                {user.profileViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Profile Views</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">
                {user.totalClicks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Link Clicks</div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        {user.products.filter((p) => p.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Featured Products
            </h2>
            <div className="space-y-3">
              {user.products
                .filter((p) => p.featured)
                .map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{product.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{product.rating}</span>
                            </div>
                            <span>{product.sales} sold</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="space-y-3 mb-8">
          {user.links
            .filter((link) => link.isActive)
            .map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`w-full p-4 bg-gradient-to-r ${link.color} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {link.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{link.title}</div>
                    <div className="text-sm opacity-75">
                      {link.clicks} clicks
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
        </div>

        {/* All Products */}
        {user.products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-green-500 mr-2" />
              Digital Products & Services
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {user.products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{product.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <span className="text-lg font-bold text-green-600">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{product.rating}</span>
                          </div>
                          <span>{product.sales} sold</span>
                        </div>
                        <span className="capitalize text-purple-600 font-medium">
                          {product.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
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

export default NelsonCreatesProfile;
