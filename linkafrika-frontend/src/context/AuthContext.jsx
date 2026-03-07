// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);          // { id, email, username, ... }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);    // For initial auth check

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /* =========================================
   *  Check auth status on app load/refresh
   * ========================================= */
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log(
        "🔍 checkAuthStatus - token present:",
        !!token,
        "| user present:",
        !!storedUser
      );

      if (!token || !storedUser) {
        console.log("❌ No token or user in storage, user is logged out");
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Use stored user immediately for fast UI
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);

      // OPTIONAL: Verify token & refresh user from backend
      try {
        const res = await authAPI.getMe();
        if (res.data?.user) {
          console.log("🔄 Refreshed user from /auth/me");
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn("⚠️ /auth/me failed, logging out", err?.response?.status);
        // If token invalid / expired, log out
        logout();
      }
    } catch (error) {
      console.error("💥 Error in checkAuthStatus:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
   *  Login
   * ========================================= */
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🔐 Logging in:", email);

      const res = await authAPI.login({ email, password });
      // Expecting { user, token } from backend
      const { user: loggedInUser, token } = res.data;

      if (!token || !loggedInUser) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setIsAuthenticated(true);

      console.log("✅ Login successful");
      return { success: true, user: loggedInUser };
    } catch (error) {
  console.error("💥 Login error:", error.response?.data || error.message);

  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Login failed. Please check your credentials.";

  return { success: false, error: msg };
} finally {
      setLoading(false);
    }
  };

  /* =========================================
   *  Register
   * ========================================= */
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("📝 Registering:", userData.email);

      const res = await authAPI.register(userData);
      // Most APIs don't auto-login on register; they just confirm.
      const message =
        res?.data?.message ||
        "Account created successfully! Please login to continue.";

      console.log("✅ Registration successful");
      return { success: true, message };
    } catch (error) {
  console.error("💥 Registration error:", error.response?.data || error.message);

  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Registration failed. Please try again.";

  return { success: false, error: msg };
} finally {
      setLoading(false);
    }
  };

  /* =========================================
   *  Update user (local + storage)
   * ========================================= */
  const updateUser = (updatedUserData) => {
    try {
      console.log("🔄 updateUser called with:", updatedUserData);

      const merged = { ...(user || {}), ...updatedUserData };
      setUser(merged);
      localStorage.setItem("user", JSON.stringify(merged));

      console.log("✅ User updated in context + localStorage");
      return { success: true, user: merged };
    } catch (error) {
      console.error("💥 updateUser error:", error);
      return { success: false, error: "Failed to update user data" };
    }
  };

  /* =========================================
   *  Logout
   * ========================================= */
  const logout = () => {
    console.log("👋 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    console.log("✅ Logged out and cleared session");
  };

  /* =========================================
   *  Refresh user explicitly (e.g. profile page)
   * ========================================= */
  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      const updated = res.data.user;
      if (updated) {
        updateUser(updated);
        return { success: true, user: updated };
      }
      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Error refreshing user:", error);
      return { success: false, error: "Failed to refresh user data" };
    }
  };

  /* =========================================
   *  Onboarding helper
   * ========================================= */
  const needsOnboarding = () => {
    if (!user) return false;
    const hasUsername = user.username && user.username.trim() !== "";
    const hasCompletedOnboarding = user.onboardingCompleted === true;

    const result = !hasUsername || !hasCompletedOnboarding;
    console.log("🔍 Onboarding check:", {
      hasUsername,
      hasCompletedOnboarding,
      needsOnboarding: result,
    });

    return result;
  };

  const value = {
    user,
    isAuthenticated,
    loading,

    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkAuthStatus,
    needsOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* avoid flashing app before auth check completes */}
      {loading ? <div /> : children}
    </AuthContext.Provider>
  );
};
