import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Also fix your checkAuthStatus error handling:
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        try {
          const response = await authAPI.verifyToken();
          if (response.data.user) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.log("Token verification failed:", error);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // FIXED: Only clear session data, not user accounts
      logout(); // This now calls the fixed logout function
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    console.log("🧹 Clearing ALL user data...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("links");
    localStorage.removeItem("analytics");
    localStorage.removeItem("users");

    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (key.startsWith("products_")) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setIsAuthenticated(false);
    console.log("✅ All data cleared successfully");
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🔐 Attempting login for:", email);

      try {
        const response = await authAPI.login({ email, password });
        const { user: userData, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        console.log("✅ Login successful via API:", userData);
        return { success: true, user: userData };
      } catch (error) {
        console.error("❌ API Login failed, trying localStorage fallback...");

        // FALLBACK: Check if user exists in localStorage users array
        let users = [];
        try {
          users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch (e) {
          console.warn("Invalid users data");
          users = [];
        }

        console.log("🔍 Searching in users array for:", email);
        console.log("📊 Total users in array:", users.length);

        const foundUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (foundUser) {
          console.log("👤 User found in localStorage:", foundUser.email);

          // Check password
          if (foundUser.password === password) {
            // IMPORTANT: Make sure user exists in users array after login
            const token = "mock_token_" + Date.now();
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(foundUser));

            setUser(foundUser);
            setIsAuthenticated(true);

            console.log("✅ Fallback login successful:", foundUser);
            return { success: true, user: foundUser };
          } else {
            console.error("❌ Password mismatch");
            return { success: false, error: "Incorrect password" };
          }
        } else {
          console.error("❌ User not found in localStorage");
          console.log(
            "📋 Available users:",
            users.map((u) => ({ email: u.email, id: u.id }))
          );
          return { success: false, error: "No account found with this email" };
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Registration should NOT log user in automatically
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("📝 Attempting registration for:", userData.email);

      try {
        const response = await authAPI.register(userData);
        console.log("✅ Registration successful via API");
        return {
          success: true,
          message: "Account created successfully! Please login to continue.",
        };
      } catch (apiError) {
        console.log("API registration failed, using localStorage fallback");

        // CRITICAL FIX: Ensure users array exists and is properly managed
        let users = [];
        try {
          users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch (e) {
          console.warn("Invalid users data, starting fresh");
          users = [];
        }

        // Check if user already exists
        if (
          users.find(
            (u) => u.email.toLowerCase() === userData.email.toLowerCase()
          )
        ) {
          return {
            success: false,
            error: "User already exists with this email",
          };
        }

        // Create new user with proper structure
        const newUser = {
          id: Date.now(), // Unique ID
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          password: userData.password, // In production, hash this!
          username: null, // Will be set during onboarding
          displayName: userData.name.trim(),
          bio: "",
          theme: "purple",
          isPro: false,
          onboardingCompleted: false,
          profileViews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to users array
        users.push(newUser);

        // Save users array
        localStorage.setItem("users", JSON.stringify(users));

        console.log("✅ User saved to localStorage users array");
        console.log("👤 New user:", { id: newUser.id, email: newUser.email });
        console.log("📊 Total users now:", users.length);

        return {
          success: true,
          message: "Account created successfully! Please login to continue.",
        };
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      const updatedUser = { ...user, ...updatedUserData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Also update in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex(
        (u) => u.id === updatedUser.id || u.email === updatedUser.email
      );
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem("users", JSON.stringify(users));
      }

      console.log("🔄 User updated:", updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return { success: false, error: "Failed to update user data" };
    }
  };

  // Replace your logout function with this:
  const logout = () => {
    console.log("👋 Logging out user...");

    // Only clear session data, NOT user accounts
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("links");
    localStorage.removeItem("analytics");

    // Clear product-specific data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (key.startsWith("products_")) {
        localStorage.removeItem(key);
      }
    });

    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);

    console.log("✅ Session cleared successfully");
    // NOTE: Users array is preserved for future logins
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Error refreshing user:", error);
      return { success: false, error: "Failed to refresh user data" };
    }
  };

  // FIXED: Better onboarding check
  const needsOnboarding = () => {
    if (!user) return false;
    const hasUsername = user.username && user.username.trim() !== "";
    const hasCompletedOnboarding = user.onboardingCompleted === true;

    console.log("🔍 Checking onboarding status:", {
      hasUsername,
      hasCompletedOnboarding,
      needsOnboarding: !hasUsername || !hasCompletedOnboarding,
    });

    return !hasUsername || !hasCompletedOnboarding;
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
    clearAllData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
