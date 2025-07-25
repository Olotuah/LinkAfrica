import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Globe,
  BarChart3,
  Crown,
  Zap,
  Shield,
  Instagram,
  Youtube,
  MessageCircle,
  ExternalLink,
  DollarSign,
  BookOpen,
  Play,
  Eye,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Real Nelson Creates data - same as in NelsonCreatesProfile
  const nelsonData = {
    username: "nelsoncretes",
    displayName: "Nelson Creates",
    bio: "Digital Marketing Expert 📱 | Content Creator 🎨 | Helping businesses grow online 🚀",
    avatar: "NC",
    profileViews: 2847,
    totalClicks: 1256,
    links: [
      {
        id: 1,
        title: "Instagram",
        url: "https://instagram.com/nelsoncretes",
        icon: <Instagram className="w-5 h-5" />,
        clicks: 432,
        color: "from-pink-500 to-purple-500",
      },
      {
        id: 2,
        title: "YouTube",
        url: "https://youtube.com/@nelsoncretes",
        icon: <Youtube className="w-5 h-5" />,
        clicks: 287,
        color: "from-red-500 to-red-600",
      },
      {
        id: 3,
        title: "WhatsApp Business",
        url: "https://wa.me/2348123456789",
        icon: <MessageCircle className="w-5 h-5" />,
        clicks: 198,
        color: "from-green-500 to-green-600",
      },
    ],
    products: [
      {
        id: 1,
        name: "Social Media Marketing Mastery",
        price: 15000,
        description: "Complete guide to growing your business on social media",
        sales: 127,
        paymentLink: "https://paystack.com/pay/social-media-mastery",
      },
      {
        id: 2,
        name: "Content Creation Bootcamp",
        price: 45000,
        description: "6-week intensive program to master content creation",
        sales: 89,
        paymentLink: "https://paystack.com/pay/content-bootcamp",
      },
    ],
  };

  const testimonials = [
    {
      name: "Adebayo Samuel",
      role: "Content Creator",
      image: "AS",
      content:
        "LinkAfrika helped me grow my Instagram following by 300% in just 2 months. The analytics are amazing!",
      rating: 5,
      verified: true,
    },
    {
      name: "Folake Johnson",
      role: "Small Business Owner",
      image: "FJ",
      content:
        "I've sold over ₦500,000 worth of products through my LinkAfrika page. Best investment I've made!",
      rating: 5,
      verified: true,
    },
    {
      name: "Chidi Okafor",
      role: "Digital Marketer",
      image: "CO",
      content:
        "The Pro features are incredible. Custom domain and advanced analytics have transformed my business.",
      rating: 5,
      verified: true,
    },
  ];

  const handleNelsonLinkClick = (link) => {
    // Track click and open link
    console.log(`Nelson link clicked: ${link.title}`);
    window.open(link.url, "_blank");
  };

  const handleNelsonProductClick = (product) => {
    console.log(`Nelson product clicked: ${product.name}`);
    window.open(product.paymentLink, "_blank");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border border-orange-200">
                  <Zap className="w-4 h-4 mr-2" />
                  Made for African Creators
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                One Link to
                <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  {" "}
                  Rule Them All
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create a stunning bio link page, sell digital products, and grow
                your audience with LinkAfrika - built specifically for Nigerian
                creators.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate("/profile/nelsoncretes")}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  View Example
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Forever Free Plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Right side - Real Nelson Creates Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                {/* Phone mockup */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto">
                  {/* Phone header */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      linkafrika.com/profile/nelsoncretes
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{nelsonData.profileViews.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Profile content */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    {/* Profile header */}
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-white text-xl font-bold">
                          {nelsonData.avatar}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {nelsonData.displayName}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {nelsonData.bio}
                      </p>
                    </div>

                    {/* Featured products */}
                    <div className="space-y-3 mb-6">
                      {nelsonData.products.slice(0, 2).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleNelsonProductClick(product)}
                          className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {product.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-bold text-green-600">
                                  ₦{product.price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {product.sales} sold
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="space-y-3">
                      {nelsonData.links.map((link) => (
                        <button
                          key={link.id}
                          onClick={() => handleNelsonLinkClick(link)}
                          className={`w-full p-3 bg-gradient-to-r ${link.color} text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group text-sm`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              {link.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">{link.title}</div>
                              <div className="text-xs opacity-75">
                                {link.clicks} clicks
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-6 pt-4 border-t border-white/30">
                      <button
                        onClick={() => navigate("/signup")}
                        className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-green-700 transition-colors shadow-lg"
                      >
                        Create Your Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                10,000+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">₦50M+</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-600">Link Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LinkAfrika provides all the tools Nigerian creators need to build
              their online presence and monetize their audience effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Beautiful Bio Pages
              </h3>
              <p className="text-gray-600 mb-6">
                Create stunning, mobile-optimized pages that perfectly represent
                your brand and personality.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom themes and colors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Mobile-first design</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Fast loading speeds</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Sell Digital Products
              </h3>
              <p className="text-gray-600 mb-6">
                Monetize your audience by selling e-books, courses, templates,
                and services directly from your page.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Paystack integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Automatic delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sales tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 mb-6">
                Get detailed insights into your audience behavior, link
                performance, and revenue metrics.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Real-time tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Geographic insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Export reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Nigerian Creators
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of creators who are growing their audience and
              revenue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {testimonial.image}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {testimonial.name}
                      </span>
                      {testimonial.verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you're ready to grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Free Forever
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">₦0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Up to 3 links</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Basic customization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Mobile optimized</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Basic analytics</span>
                </li>
              </ul>

              <button
                onClick={handleGetStarted}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl p-8 shadow-xl text-white relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Crown className="w-4 h-4" />
                  <span>Most Popular</span>
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro Creator</h3>
                <div className="text-4xl font-bold mb-4">₦3,000</div>
                <p className="opacity-90">Everything you need to monetize</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Unlimited links</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Sell digital products</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Remove LinkAfrika branding</span>
                </li>
              </ul>

              <button
                onClick={() => navigate("/pricing")}
                className="w-full bg-white text-orange-600 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Start 7-Day Free Trial
              </button>

              <p className="text-center text-sm opacity-75 mt-3">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real User Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See LinkAfrika in Action
            </h2>
            <p className="text-xl text-gray-600">
              Real creators using LinkAfrika to grow their business
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Profile info */}
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {nelsonData.avatar}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {nelsonData.displayName}
                    </h3>
                    <p className="text-gray-600">@{nelsonData.username}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Pro User
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  {nelsonData.bio}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {nelsonData.profileViews.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {nelsonData.totalClicks.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Link Clicks</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate("/profile/nelsoncretes")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="mr-2 w-5 h-5" />
                    View Full Profile
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-purple-200"
                  >
                    Create Your Own
                  </button>
                </div>
              </div>

              {/* Right side - Mini preview */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto">
                  {/* Mini profile header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-lg font-bold">
                        {nelsonData.avatar}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {nelsonData.displayName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {nelsonData.bio.slice(0, 60)}...
                    </p>
                  </div>

                  {/* Sample links */}
                  <div className="space-y-3">
                    {nelsonData.links.slice(0, 3).map((link, index) => (
                      <div
                        key={link.id}
                        className={`p-3 bg-gradient-to-r ${link.color} text-white rounded-lg flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            {link.icon}
                          </div>
                          <span className="font-semibold text-sm">
                            {link.title}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    ))}
                  </div>

                  {/* Product showcase */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-900 mb-3">
                      Featured Products
                    </div>
                    <div className="space-y-2">
                      {nelsonData.products.slice(0, 2).map((product) => (
                        <div
                          key={product.id}
                          className="bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {product.name.slice(0, 25)}...
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              ₦{product.price.toLocaleString()}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₦
                      {(
                        nelsonData.products.reduce(
                          (sum, p) => sum + p.price * p.sales,
                          0
                        ) / 1000000
                      ).toFixed(1)}
                      M+
                    </div>
                    <div className="text-xs text-gray-600">
                      Revenue Generated
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {nelsonData.products.reduce((sum, p) => sum + p.sales, 0)}
                      +
                    </div>
                    <div className="text-xs text-gray-600">Products Sold</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Growing Your Audience?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join over 10,000 Nigerian creators who are building their online
            presence with LinkAfrika
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free Today
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-black/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-black/30 transition-colors border border-white/20"
            >
              View Pricing Plans
            </button>
          </div>

          <p className="text-sm opacity-75 mt-6">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LA</span>
                </div>
                <span className="text-xl font-bold">LinkAfrika</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate link-in-bio tool built specifically for African
                creators. Grow your audience, sell products, and track your
                success.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/linkafrika"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://youtube.com/@linkafrika"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Youtube className="w-6 h-6" />
                </a>
                <a
                  href="mailto:hello@linkafrika.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 LinkAfrika. Made with ❤️ in Nigeria.
            </p>
            <p className="text-gray-400 text-sm mt-4 sm:mt-0">
              Built for creators, by creators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
