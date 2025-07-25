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

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log(
        "🔍 checkAuthStatus - Token:",
        token?.substring(0, 20) + "..."
      );
      console.log("🔍 checkAuthStatus - Has userData:", !!userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log("📦 Parsed user from session:", {
          email: parsedUser.email,
          username: parsedUser.username,
          onboardingCompleted: parsedUser.onboardingCompleted,
          isPro: parsedUser.isPro,
          theme: parsedUser.theme,
        });

        // CRITICAL: Set user data immediately and never change it for localStorage users
        setUser(parsedUser);
        setIsAuthenticated(true);

        // SKIP ALL API CALLS FOR LOCALSTORAGE USERS
        if (token.startsWith("mock_token_")) {
          console.log(
            "🔒 localStorage user detected - DATA IS FINAL, no API calls"
          );
          setLoading(false);
          return; // EXIT HERE - no API verification
        }

        // Only for real API users (this should rarely happen in your app)
        console.log("🌐 Real API token detected, verifying...");
        try {
          const response = await authAPI.verifyToken();
          if (response.data.user) {
            console.log("🔄 Updating with fresh API data");
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.log("❌ API verification failed:", error.message);
          // Keep localStorage data
        }
      } else {
        console.log("❌ No token or userData found");
      }
    } catch (error) {
      console.error("💥 Error in checkAuthStatus:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🔐 Starting login for:", email);
      console.log("🔐 Password length:", password?.length);

      // Check localStorage FIRST
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users") || "[]");
      } catch (e) {
        users = [];
      }

      console.log("🔍 Total users in localStorage:", users.length);
      console.log(
        "🔍 All users emails:",
        users.map((u) => u.email)
      );

      const foundLocalUser = users.find(
        (u) => u.email && u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (foundLocalUser) {
        console.log("👤 User found in localStorage:", foundLocalUser.email);
        console.log("🔑 Password comparison:");
        console.log("  - Stored password:", foundLocalUser.password);
        console.log("  - Entered password:", password);
        console.log("  - Has password:", !!foundLocalUser.password);
        console.log(
          "  - Needs password reset:",
          foundLocalUser.needsPasswordReset
        );

        // Handle users who need password reset (API registrations)
        if (!foundLocalUser.password || foundLocalUser.needsPasswordReset) {
          console.log("🔧 User needs password reset - updating password");

          // Update the user's password in localStorage
          const userIndex = users.findIndex(
            (u) => u.email === foundLocalUser.email
          );
          if (userIndex !== -1) {
            users[userIndex].password = password;
            users[userIndex].needsPasswordReset = false;
            delete users[userIndex].registeredViaAPI;

            localStorage.setItem("users", JSON.stringify(users));
            console.log("✅ Password updated for user");

            // Update foundLocalUser for the login process
            foundLocalUser.password = password;
            foundLocalUser.needsPasswordReset = false;
          }
        }

        if (foundLocalUser.password === password) {
          console.log("✅ Password match confirmed");

          const token = "mock_token_" + Date.now();
          const completeUserData = { ...foundLocalUser };

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(completeUserData));
          setUser(completeUserData);
          setIsAuthenticated(true);

          console.log("✅ localStorage login successful");
          return { success: true, user: completeUserData };
        } else {
          console.error("❌ Password mismatch");
          return { success: false, error: "Incorrect password" };
        }
      }

      // Try API if user not in localStorage
      console.log("🌐 User not in localStorage, trying API...");
      try {
        const response = await authAPI.login({ email, password });
        const { user: userData, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        console.log("✅ API login successful");
        return { success: true, user: userData };
      } catch (apiError) {
        console.log("❌ API login failed and user not in localStorage");
        return { success: false, error: "No account found with this email" };
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("📝 Registering:", userData.email);

      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users") || "[]");
      } catch (e) {
        users = [];
      }

      // Check for existing user
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase().trim()
      );

      if (existingUser) {
        return {
          success: false,
          error:
            "An account with this email already exists. Please login instead.",
        };
      }

      // Try API first
      try {
        const response = await authAPI.register(userData);
        console.log("✅ API registration successful");
        return {
          success: true,
          message: "Account created successfully! Please login to continue.",
        };
      } catch (apiError) {
        console.log("🔄 API failed, using localStorage...");

        // Create new user
        const newUser = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          username: null,
          displayName: userData.name.trim(),
          bio: "",
          theme: "purple",
          isPro: false,
          onboardingCompleted: false,
          profileViews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        console.log("✅ localStorage registration successful");
        return {
          success: true,
          message: "Account created successfully! Please login to continue.",
        };
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
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
      console.log("🔄 updateUser called with:", updatedUserData);

      const updatedUser = { ...user, ...updatedUserData };

      console.log("📦 Complete updated user:", {
        email: updatedUser.email,
        username: updatedUser.username,
        onboardingCompleted: updatedUser.onboardingCompleted,
        isPro: updatedUser.isPro,
        theme: updatedUser.theme,
      });

      // Update session
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // CRITICAL: Update users array
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex(
        (u) => u.id === updatedUser.id || u.email === updatedUser.email
      );

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUserData };
        localStorage.setItem("users", JSON.stringify(users));
        console.log("✅ Updated users array at index", userIndex);
      } else {
        console.warn("⚠️ User not found in users array for update");
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("💥 updateUser error:", error);
      return { success: false, error: "Failed to update user data" };
    }
  };

  const logout = () => {
  console.log("👋 Logging out...");

  // Clear session only - preserve user data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setUser(null);
  setIsAuthenticated(false);

  console.log("✅ Session cleared - user data preserved");
};

  const clearAllData = () => {
    console.log("🧹 Clearing ALL data including users...");

    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);

    console.log("✅ All data cleared");
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

  const needsOnboarding = () => {
    if (!user) return false;
    const hasUsername = user.username && user.username.trim() !== "";
    const hasCompletedOnboarding = user.onboardingCompleted === true;

    console.log("🔍 Onboarding check:", {
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
