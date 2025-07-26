import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnalyticsTracker from "../utils/analytics";
import { analyticsAPI, linksAPI } from "../utils/api";
import {
  ArrowLeft,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Download,
  Share2,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Crown,
} from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [links, setLinks] = useState([]);
  const [timeRange, setTimeRange] = useState("7");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, user]);

  // Add this at the top of your Analytics component, after the imports
  const getUserKey = (user, prefix = "") => {
    const identifier = user?.email;

    if (!identifier) {
      console.error("❌ No email found for user key generation:", user);
      return null;
    }

    const key = prefix ? `${prefix}_${identifier}` : identifier;
    console.log(`🔑 Generated key: "${key}" from user email: ${user?.email}`);
    return key;
  };

  // Add this temporary debug function right after getUserKey in your Analytics component

  const debugLinkKeys = (user) => {
    console.log("🔍 === ANALYTICS LINK DEBUG ===");
    console.log("User object:", {
      id: user?.id,
      email: user?.email,
      username: user?.username,
    });

    // Test key generation
    const testKey = getUserKey(user, "links");
    console.log("Generated key:", testKey);

    // Check what's actually in localStorage
    console.log("All localStorage keys containing 'links':");
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("links")) {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        console.log(`📦 ${key}: ${data.length} links`);
        if (data.length > 0) {
          console.log("   Sample link:", data[0]);
        }
      }
    });

    // Try loading with the key we generated
    if (testKey) {
      const savedLinks = JSON.parse(localStorage.getItem(testKey) || "[]");
      console.log(
        `✅ Links found with generated key "${testKey}":`,
        savedLinks.length
      );
    }

    console.log("🔍 === END DEBUG ===");
  };

  // FIXED: Replace your loadAnalytics function in Analytics.jsx with this:

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      console.log("📊 Loading analytics for user:", user?.email);

      const analytics = await AnalyticsTracker.getAnalyticsData(
        user?.id || user?.email,
        parseInt(timeRange)
      );

      // FIXED: Load links using consistent key generation (same as Dashboard)
      const userLinksKey = getUserKey(user, "links");
      let savedLinks = [];

      if (userLinksKey) {
        savedLinks = JSON.parse(localStorage.getItem(userLinksKey) || "[]");
        setLinks(savedLinks);
        console.log(
          `📦 Analytics links loaded from ${userLinksKey}:`,
          savedLinks.length
        );
      } else {
        console.error("❌ Could not generate user key for links");
        setLinks([]);
      }

      // FIXED: Calculate active/total links from actual data
      const totalLinks = savedLinks.length;
      const activeLinks = savedLinks.filter((link) => link.isActive).length;

      // FIXED: Update stats with real link counts
      const updatedStats = {
        ...analytics,
        totalLinks: totalLinks,
        activeLinks: activeLinks,
      };

      setStats(updatedStats);

      console.log("✅ Analytics loaded");
      console.log(`📊 Links summary: ${activeLinks}/${totalLinks} active`);
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
      setStats(AnalyticsTracker.getEmptyAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      stats,
      links: links.map((link) => ({
        title: link.title,
        url: link.url,
        clicks: link.clicks,
        type: link.type,
      })),
      exportDate: new Date().toISOString(),
      timeRange: `${timeRange} days`,
      user: {
        email: user?.email,
        username: user?.username,
        isPro: user?.isPro,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkafrika-analytics-${user?.username || user?.email}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareAnalytics = () => {
    const shareText = `Check out my LinkAfrika stats!\n\n📊 Profile Views: ${
      stats?.profileViews || 0
    }\n🔗 Link Clicks: ${stats?.totalClicks || 0}\n📈 Growth: +${
      stats?.monthlyGrowth || 0
    }%\n\nCreate your own at linkafrika.com`;

    if (navigator.share) {
      navigator.share({
        title: "My LinkAfrika Analytics",
        text: shareText,
        url: `${window.location.origin}/profile/${
          user?.username || user?.email
        }`,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Analytics summary copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-orange-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your performance and growth</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            <button
              onClick={shareAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Pro Upgrade Banner */}
        {!user?.isPro && (
          <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Unlock Advanced Analytics 📊
                </h2>
                <p className="opacity-90">
                  Get detailed insights, conversion tracking, and revenue
                  analytics with Pro
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div className="flex items-center space-x-2">
                    <PieChart className="w-4 h-4" />
                    <span>Advanced charts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Custom date ranges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Growth predictions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Revenue tracking</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 flex items-center space-x-2 transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.profileViews?.toLocaleString() || 0}
                </p>
                <p className="text-green-600 text-sm mt-1">
                  +{stats?.monthlyGrowth || 0}% this month
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Link Clicks</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalClicks?.toLocaleString() || 0}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  {stats?.conversionRate || 0}% click rate
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Links</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.activeLinks || 0}
                </p>
                <p className="text-purple-600 text-sm mt-1">
                  of {stats?.totalLinks || 0} total
                </p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  {user?.isPro ? "Revenue" : "Upgrade for Revenue"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.isPro
                    ? `₦${stats?.earnings?.toLocaleString() || 0}`
                    : "₦0"}
                </p>
                <p className="text-orange-600 text-sm mt-1">
                  {user?.isPro ? "this month" : "Go Pro"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 text-orange-600 mr-2" />
              Daily Activity ({timeRange} days)
            </h3>
            <div className="space-y-3">
              {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                stats.dailyStats.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 w-16">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center space-x-4 flex-1 ml-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{day.views} views</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  (day.views /
                                    Math.max(
                                      ...stats.dailyStats.map((d) => d.views)
                                    )) *
                                    100
                                )
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{day.clicks} clicks</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  (day.clicks /
                                    Math.max(
                                      ...stats.dailyStats.map((d) => d.clicks)
                                    )) *
                                    100
                                )
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No data available for this period
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start getting views and clicks to see your activity here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Links */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Top Performing Links
            </h3>
            <div className="space-y-3">
              {links && links.length > 0 ? (
                links
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .slice(0, 5)
                  .map((link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {link.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {link.clicks || 0}
                        </p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No links yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add some links to see performance data
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                  >
                    Add Your First Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 text-purple-600 mr-2" />
              Performance Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best performing day</span>
                <span className="font-medium">
                  {stats?.dailyStats && stats.dailyStats.length > 0
                    ? new Date(
                        stats.dailyStats.reduce((best, day) =>
                          day.clicks + day.views > best.clicks + best.views
                            ? day
                            : best
                        ).date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "No data"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average daily views</span>
                <span className="font-medium">
                  {stats?.profileViews && stats?.dailyStats?.length
                    ? Math.round(stats.profileViews / parseInt(timeRange))
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Click-through rate</span>
                <span className="font-medium text-green-600">
                  {stats?.conversionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Most popular link</span>
                <span className="font-medium truncate max-w-24">
                  {links && links.length > 0
                    ? links.reduce((top, link) =>
                        (link.clicks || 0) > (top.clicks || 0) ? link : top
                      ).title
                    : "No links"}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Growth Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Profile Views Growth</span>
                  <span className="font-medium text-green-600">
                    +{stats?.monthlyGrowth || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, stats?.monthlyGrowth || 0)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Link Performance</span>
                  <span className="font-medium">
                    {stats?.activeLinks || 0}/{stats?.totalLinks || 0} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats?.totalLinks > 0
                          ? (stats.activeLinks / stats.totalLinks) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {user?.isPro && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Revenue Growth</span>
                    <span className="font-medium text-green-600">
                      ₦{stats?.earnings?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    Manage Links
                  </span>
                </div>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `/profile/${user?.username || user?.email}`,
                    "_blank"
                  )
                }
                className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">
                    View Profile
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/pricing")}
                className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-900">
                    {user?.isPro ? "Pro Settings" : "Upgrade to Pro"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Share Your Success! 🎉</h2>
          <p className="opacity-90 mb-4">
            Proud of your growth? Share your LinkAfrika stats with your audience
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={shareAnalytics}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Share Stats
            </button>
            <button
              onClick={() =>
                window.open(
                  `/profile/${user?.username || user?.email}`,
                  "_blank"
                )
              }
              className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              View Public Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
