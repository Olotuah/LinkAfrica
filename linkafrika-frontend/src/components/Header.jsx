import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Crown,
  ExternalLink,
  ArrowLeft,
  Home,
  BarChart3,
  Plus,
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDashboard = location.pathname.includes("/dashboard");
  const isProfilePage = location.pathname.includes("/profile/");

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo & Navigation */}
          <div className="flex items-center space-x-4">
            {/* Back button for dashboard */}
            {isDashboard && (
              <button
                onClick={() => navigate("/")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                LinkAfrika
              </span>
            </Link>

            {/* Dashboard navigation */}
            {isDashboard && (
              <nav className="hidden md:flex items-center space-x-1 ml-8">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard/analytics"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytics
                </Link>
                <Link
                  to="/dashboard/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard/settings"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </Link>
              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Pro badge */}
                {user?.isPro && (
                  <div className="hidden sm:flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    <span>Pro</span>
                  </div>
                )}

                {/* Quick action buttons */}
                {isDashboard && (
                  <div className="hidden md:flex items-center space-x-2">
                    <button
                      onClick={() =>
                        window.open(`/profile/${user?.username}`, "_blank")
                      }
                      className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      disabled={!user?.username}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>

                    {!user?.isPro && (
                      <button
                        onClick={() => navigate("/pricing")}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-green-500 text-white px-3 py-2 rounded-lg hover:from-orange-600 hover:to-green-600 transition-colors text-sm"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                      </div>
                      {user?.username && (
                        <div className="text-xs text-gray-500">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="font-medium text-gray-900">
                          {user?.name || "User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.email}
                        </div>
                        {user?.username && (
                          <div className="text-xs text-purple-600">
                            linkafrika.com/{user.username}
                          </div>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>

                      {user?.username ? (
                        <button
                          onClick={() => {
                            window.open(`/profile/${user.username}`, "_blank");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Public Profile</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            navigate("/onboarding");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-orange-600 hover:bg-orange-50 transition-colors w-full text-left"
                        >
                          <User className="w-4 h-4" />
                          <span>Complete Setup</span>
                        </button>
                      )}

                      <Link
                        to="/dashboard/analytics"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      {!user?.isPro && (
                        <Link
                          to="/pricing"
                          className="flex items-center space-x-3 px-4 py-2 text-orange-600 hover:bg-orange-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Crown className="w-4 h-4" />
                          <span>Upgrade to Pro</span>
                        </Link>
                      )}

                      <hr className="my-2" />

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Not authenticated */}
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.username ? (
                  <button
                    onClick={() => {
                      window.open(`/profile/${user.username}`, "_blank");
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    View Profile
                  </button>
                ) : (
                  <Link
                    to="/onboarding"
                    className="block px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Complete Setup
                  </Link>
                )}
                <Link
                  to="/dashboard/analytics"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                {!user?.isPro && (
                  <Link
                    to="/pricing"
                    className="block px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upgrade to Pro
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
