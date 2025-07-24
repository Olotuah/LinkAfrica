import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import UserProfile from "./components/UserProfile";
import Dashboard from "./components/Dashboard";
import OnboardingFlow from "./components/OnboardingFlow";
import Analytics from "./pages/Analytics";
import Pricing from "./pages/Pricing";

// Real Navigation Component
// Real Navigation Component
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Don't show navbar on public profile pages and onboarding
  const isPublicProfile = location.pathname.startsWith("/profile/");
  const isOnboarding = location.pathname.startsWith("/onboarding");
  if (isPublicProfile || isOnboarding) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LinkAfrika</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Get Started Free
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation("/analytics")}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Analytics
                </button>
                {/* Show My Page if user has username, otherwise show Complete Setup */}
                {user?.username ? (
                  <button
                    onClick={() =>
                      handleNavigation(`/profile/${user.username}`)
                    }
                    className="text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    My Page
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation("/onboarding")}
                    className="text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Complete Setup
                  </button>
                )}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() ||
                          user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 hidden sm:block">
                      {user?.name || user?.displayName || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none focus:text-orange-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation("/")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="block w-full text-left px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                  >
                    Get Started Free
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation("/")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleNavigation("/dashboard")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation("/analytics")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Analytics
                  </button>
                  {user?.username ? (
                    <button
                      onClick={() =>
                        handleNavigation(`/profile/${user.username}`)
                      }
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      My Page
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation("/onboarding")}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      Complete Setup
                    </button>
                  )}
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() ||
                            user?.displayName?.charAt(0)?.toUpperCase() ||
                            user?.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user?.name || user?.displayName || user?.email}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
// Login Page Component
const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      console.log("✅ Login successful, checking onboarding status...");

      // Check if user needs onboarding
      if (!result.user?.username || !result.user?.onboardingCompleted) {
        console.log("User needs onboarding, redirecting...");
        navigate("/onboarding");
      } else {
        console.log("User login complete, going to dashboard...");
        navigate("/dashboard");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">LA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to your LinkAfrika account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// FIXED: Signup Page Component
const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  // UPDATED: Enhanced handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Enhanced client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Check for existing user before attempting registration
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase().trim()
      );
      
      if (existingUser) {
        setError("An account with this email already exists. Please login instead.");
        setLoading(false);
        return;
      }
    } catch (storageError) {
      console.warn("Could not check existing users:", storageError);
    }

    console.log("🚀 Starting registration process...");
    
    // Prepare clean data
    const cleanFormData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    };
    
    const result = await register(cleanFormData);

    if (result.success) {
      console.log("✅ Registration successful, redirecting to login...");
      setSuccess(result.message || "Account created successfully! Please login to continue.");

      // Clear form
      setFormData({ name: "", email: "", password: "" });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">LA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join LinkAfrika!</h1>
          <p className="text-gray-600">Create your account and start growing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// FIXED: Onboarding Protected Route
const OnboardingProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user has completed onboarding, redirect to dashboard
  if (user?.username && user?.onboardingCompleted) {
    return <Navigate to="/dashboard?welcome=true" />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading LinkAfrika...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* FIXED: Onboarding with proper protection */}
        <Route
          path="/onboarding"
          element={
            <OnboardingProtectedRoute>
              <OnboardingFlow />
            </OnboardingProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Public Profile Routes */}
        <Route path="/profile/:username" element={<UserProfile />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
