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
        console.log("🔍 Loading user from session:", {
          username: parsedUser.username,
          onboardingCompleted: parsedUser.onboardingCompleted,
          isPro: parsedUser.isPro,
        });

        setUser(parsedUser);
        setIsAuthenticated(true);

        // CRITICAL FIX: For localStorage users, skip API verification entirely
        if (token.startsWith("mock_token_")) {
          console.log(
            "📱 Mock token detected - localStorage user, skipping API verification"
          );
          // Keep the localStorage data as-is, don't make any API calls
          return;
        }

        // Only for real API tokens
        try {
          const response = await authAPI.verifyToken();
          if (response.data.user) {
            const apiUser = response.data.user;
            console.log("🔍 API user data:", apiUser);

            // CRITICAL: Only update if API has MORE complete data than localStorage
            const hasOnboardingData =
              apiUser.username &&
              apiUser.onboardingCompleted !== undefined &&
              apiUser.theme &&
              apiUser.displayName;

            if (hasOnboardingData) {
              console.log("✅ API has complete onboarding data, updating...");
              setUser(apiUser);
              localStorage.setItem("user", JSON.stringify(apiUser));
            } else {
              console.log(
                "⚠️ API missing onboarding data, keeping localStorage version"
              );
              console.log("  - API username:", apiUser.username);
              console.log(
                "  - API onboardingCompleted:",
                apiUser.onboardingCompleted
              );
              console.log("  - Local username:", parsedUser.username);
              console.log(
                "  - Local onboardingCompleted:",
                parsedUser.onboardingCompleted
              );
            }
          }
        } catch (error) {
          console.log("Token verification failed:", error.message);
          // Keep localStorage data - don't change anything
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      logout();
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
        console.log("❌ API Login failed, trying localStorage fallback...");

        // CRITICAL FALLBACK: Check localStorage users array
        let users = [];
        try {
          users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch (e) {
          console.warn("Invalid users data");
          users = [];
        }

        console.log("🔍 Searching in users array for:", email);
        console.log("📊 Total users in array:", users.length);

        // Find user with case-insensitive email matching
        const foundUser = users.find(
          (u) => u.email && u.email.toLowerCase() === email.toLowerCase().trim()
        );

        if (foundUser) {
          console.log("👤 User found in localStorage:", foundUser.email);
          console.log("🔍 User complete data:", foundUser);

          // CRITICAL: Log all important fields
          console.log("📊 User onboarding data:");
          console.log("  - Username:", foundUser.username);
          console.log(
            "  - Onboarding completed:",
            foundUser.onboardingCompleted
          );
          console.log("  - Pro status:", foundUser.isPro);
          console.log("  - Theme:", foundUser.theme);
          console.log("  - Display name:", foundUser.displayName);
          console.log("  - Bio:", foundUser.bio);

          // Check password
          if (foundUser.password === password) {
            // Generate token and set session with COMPLETE user data
            const token = "mock_token_" + Date.now();

            // CRITICAL: Ensure we preserve ALL user data, not just basic fields
            const completeUserData = {
              id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              displayName: foundUser.displayName,
              username: foundUser.username,
              bio: foundUser.bio,
              theme: foundUser.theme,
              isPro: foundUser.isPro,
              onboardingCompleted: foundUser.onboardingCompleted,
              profileViews: foundUser.profileViews || 0,
              createdAt: foundUser.createdAt,
              updatedAt: foundUser.updatedAt,
              // Include any other fields that might exist
              ...foundUser,
            };

            console.log(
              "💾 Saving complete user data to session:",
              completeUserData
            );

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(completeUserData));

            setUser(completeUserData);
            setIsAuthenticated(true);

            console.log("✅ Fallback login successful with complete data");
            console.log("✅ Session user data saved:", {
              username: completeUserData.username,
              onboardingCompleted: completeUserData.onboardingCompleted,
              isPro: completeUserData.isPro,
            });

            return { success: true, user: completeUserData };
          } else {
            console.error("❌ Password mismatch");
            return { success: false, error: "Incorrect password" };
          }
        } else {
          console.error("❌ User not found in localStorage");
          console.log(
            "📋 Available users:",
            users.map((u) => ({
              email: u.email,
              id: u.id,
              username: u.username,
              onboardingCompleted: u.onboardingCompleted,
            }))
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

      // CRITICAL: Always check localStorage first to prevent duplicates
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users") || "[]");
      } catch (e) {
        console.warn("Invalid users data, starting fresh");
        users = [];
      }

      // Check if user already exists in localStorage FIRST
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase().trim()
      );

      if (existingUser) {
        console.log("❌ User already exists in localStorage:", userData.email);
        return {
          success: false,
          error:
            "An account with this email already exists. Please login instead.",
        };
      }

      try {
        // Try API registration first
        const response = await authAPI.register(userData);
        console.log("✅ Registration successful via API");
        return {
          success: true,
          message: "Account created successfully! Please login to continue.",
        };
      } catch (apiError) {
        console.log("API registration failed, using localStorage fallback");

        // Double-check for duplicates again (race condition protection)
        const updatedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const duplicateCheck = updatedUsers.find(
          (u) => u.email.toLowerCase() === userData.email.toLowerCase().trim()
        );

        if (duplicateCheck) {
          return {
            success: false,
            error:
              "An account with this email already exists. Please login instead.",
          };
        }

        // Create new user with proper structure and unique ID
        const newUser = {
          id: Date.now() + Math.floor(Math.random() * 1000), // More unique ID
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

        console.log("👤 Creating new user:", {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        });

        // Add to users array
        users.push(newUser);

        // Save users array with error handling
        try {
          localStorage.setItem("users", JSON.stringify(users));
          console.log("✅ User saved to localStorage users array");
          console.log("👤 New user:", { id: newUser.id, email: newUser.email });
          console.log("📊 Total users now:", users.length);

          // Verify the save worked
          const verifyUsers = JSON.parse(localStorage.getItem("users") || "[]");
          const verifyUser = verifyUsers.find((u) => u.email === newUser.email);
          if (verifyUser) {
            console.log("✅ Registration verification successful");
          } else {
            console.error("❌ Registration verification failed");
          }
        } catch (storageError) {
          console.error("❌ Failed to save to localStorage:", storageError);
          return {
            success: false,
            error: "Failed to create account. Please try again.",
          };
        }

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
  
  // Clear only session-related data
  localStorage.removeItem("token");
  localStorage.removeItem("links");
  localStorage.removeItem("analytics");

  // Do not clear user data (keep onboarding data intact)
  // localStorage.removeItem("user");

  // Reset auth state
  setUser(null);
  setIsAuthenticated(false);

  console.log("✅ Session cleared successfully");
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

  // Add this to your Dashboard component for debugging
  const DebugOnboardingData = () => {
    const { user } = useAuth();

    const checkUsersArray = () => {
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const currentUserEmail = user?.email;
        const userInArray = users.find((u) => u.email === currentUserEmail);

        console.log("🔍 ONBOARDING DEBUG:");
        console.log("Current auth user:", {
          email: user?.email,
          username: user?.username,
          onboardingCompleted: user?.onboardingCompleted,
          isPro: user?.isPro,
          theme: user?.theme,
        });

        console.log("User in users array:", {
          email: userInArray?.email,
          username: userInArray?.username,
          onboardingCompleted: userInArray?.onboardingCompleted,
          isPro: userInArray?.isPro,
          theme: userInArray?.theme,
        });

        console.log(
          "Session storage user:",
          JSON.parse(localStorage.getItem("user") || "{}")
        );
        console.log("Token:", localStorage.getItem("token"));
      } catch (error) {
        console.error("Debug error:", error);
      }
    };

    return (
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-red-800 mb-2">🐛 Onboarding Debug</h3>
        <button
          onClick={checkUsersArray}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Check Onboarding Data
        </button>
        <div className="mt-2 text-sm text-red-700">
          <p>
            Auth User: {user?.username || "No username"} | Onboarding:{" "}
            {user?.onboardingCompleted ? "✅" : "❌"} | Pro:{" "}
            {user?.isPro ? "✅" : "❌"}
          </p>
        </div>
      </div>
    );
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
