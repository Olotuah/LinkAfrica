import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI, authAPI, linksAPI } from "../utils/api";
import {
  User,
  Link as LinkIcon,
  Palette,
  Crown,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Smartphone,
  Shield,
} from "lucide-react";

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: "",
    displayName: user?.name || "",
    bio: "",
    theme: "purple",
    isPro: false,
  });

  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });

  const [initialLinks, setInitialLinks] = useState([
    { type: "instagram", title: "Instagram", url: "", enabled: false },
    { type: "youtube", title: "YouTube", url: "", enabled: false },
    { type: "whatsapp", title: "WhatsApp", url: "", enabled: false },
    { type: "website", title: "Website", url: "", enabled: false },
  ]);

  const themes = [
    {
      id: "purple",
      name: "Purple Gradient",
      preview: "from-purple-500 to-pink-500",
    },
    { id: "blue", name: "Ocean Blue", preview: "from-blue-500 to-cyan-500" },
    {
      id: "orange",
      name: "Sunset Orange",
      preview: "from-orange-500 to-red-500",
    },
    {
      id: "green",
      name: "Forest Green",
      preview: "from-green-500 to-emerald-500",
    },
  ];

  // Redirect if already completed onboarding
  useEffect(() => {
    if (user?.onboardingCompleted && user?.username) {
      navigate("/dashboard?welcome=true");
    }
  }, [user, navigate]);

  // Check username availability with debounce
  useEffect(() => {
    if (profileData.username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(profileData.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameStatus({ checking: false, available: null, message: "" });
    }
  }, [profileData.username]);

  const checkUsernameAvailability = async (username) => {
    setUsernameStatus({ checking: true, available: null, message: "" });

    try {
      // First try API check
      try {
        const response = await authAPI.checkUsername(username);
        setUsernameStatus({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
        return;
      } catch (apiError) {
        console.log("API username check failed, using localStorage fallback");
      }

      // FALLBACK: Check localStorage users array
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users") || "[]");
      } catch (e) {
        console.warn("Invalid users data");
        users = [];
      }

      // Check if username is taken by any user
      const usernameTaken = users.some(
        (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
      );

      if (usernameTaken) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: "Username is already taken",
        });
      } else {
        setUsernameStatus({
          checking: false,
          available: true,
          message: "Username is available!",
        });
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Error checking username availability",
      });
    }
  };

  const validateStep1 = () => {
    if (!profileData.username) {
      setError("Username is required");
      return false;
    }

    if (profileData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!profileData.displayName) {
      setError("Display name is required");
      return false;
    }

    if (!usernameStatus.available) {
      setError("Please choose an available username");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (currentStep === 1 && !validateStep1()) {
        setIsLoading(false);
        return;
      }

      if (currentStep === 4) {
        // If Pro is selected, show payment modal
        if (profileData.isPro) {
          setShowPaymentModal(true);
          setIsLoading(false);
        } else {
          // Complete onboarding for free users
          await completeOnboarding();
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error in onboarding:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (paymentMethod) => {
    setProcessingPayment(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`Processing ${paymentMethod} payment for Pro upgrade`);

      // Close payment modal
      setShowPaymentModal(false);

      // Complete onboarding with Pro status
      await completeOnboarding();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      console.log("🚀 Starting onboarding completion...");
      console.log("📝 Profile data to save:", profileData);

      const updateData = {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        theme: profileData.theme,
        isPro: profileData.isPro,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      console.log("📝 Updating profile with:", updateData);

      // Get current user with better error handling
      let currentUser;
      try {
        currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      } catch (e) {
        console.error("Failed to parse current user");
        throw new Error("Session error. Please login again.");
      }

      console.log("👤 Current user before update:", currentUser);

      if (!currentUser.id && !currentUser.email) {
        throw new Error("No current user found. Please login again.");
      }

      // Update current user in localStorage
      const updatedCurrentUser = { ...currentUser, ...updateData };

      try {
        localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
        console.log(
          "✅ Updated current user in localStorage:",
          updatedCurrentUser
        );
      } catch (storageError) {
        console.error("❌ Failed to update current user:", storageError);
        throw new Error("Failed to save user session. Please try again.");
      }

      // CRITICAL: Update users array with comprehensive error handling
      let users = [];
      try {
        const usersData = localStorage.getItem("users");
        console.log("📊 Raw users data from localStorage:", usersData);
        users = JSON.parse(usersData || "[]");
      } catch (e) {
        console.warn("Invalid users data, starting fresh:", e);
        users = [];
      }

      console.log("📊 Users array before update:", users.length, "users");
      console.log(
        "🔍 Looking for user with ID:",
        currentUser.id,
        "or email:",
        currentUser.email
      );

      // Find user with multiple fallback methods
      let userIndex = -1;
      let foundUser = null;

      // Method 1: Find by ID
      if (currentUser.id) {
        userIndex = users.findIndex((u) => u.id === currentUser.id);
        if (userIndex !== -1) {
          foundUser = users[userIndex];
          console.log("✅ Found user by ID at index:", userIndex);
        }
      }

      // Method 2: Find by email (case-insensitive)
      if (userIndex === -1 && currentUser.email) {
        userIndex = users.findIndex(
          (u) =>
            u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (userIndex !== -1) {
          foundUser = users[userIndex];
          console.log("✅ Found user by email at index:", userIndex);
        }
      }

      // Method 3: Find by existing username (in case of re-onboarding)
      if (userIndex === -1 && currentUser.username) {
        userIndex = users.findIndex(
          (u) =>
            u.username &&
            u.username.toLowerCase() === currentUser.username.toLowerCase()
        );
        if (userIndex !== -1) {
          foundUser = users[userIndex];
          console.log(
            "✅ Found user by existing username at index:",
            userIndex
          );
        }
      }

      if (userIndex !== -1 && foundUser) {
        // Update existing user completely
        const updatedUser = { ...foundUser, ...updateData };
        users[userIndex] = updatedUser;
        console.log(`✅ Updated existing user at index ${userIndex}`);
        console.log("🔄 Updated user data:", updatedUser);
      } else {
        // If user not found, add them
        console.warn("⚠️ User not found in users array, adding them...");
        console.log(
          "🔍 All users in array:",
          users.map((u) => ({ id: u.id, email: u.email, username: u.username }))
        );

        const newUser = { ...updatedCurrentUser };
        users.push(newUser);
        userIndex = users.length - 1;
        console.log("✅ Added user to users array at index:", userIndex);
      }

      // Save updated users array with comprehensive error handling
      try {
        const usersJson = JSON.stringify(users);
        localStorage.setItem("users", usersJson);
        console.log("💾 Saved users array with", users.length, "users");
        console.log("💾 Saved data size:", usersJson.length, "characters");
      } catch (storageError) {
        console.error("❌ Failed to save users array:", storageError);
        console.error("❌ Storage error details:", storageError.message);

        // Try to clean up localStorage and retry
        try {
          // Remove non-essential data and retry
          const essentialUsers = users.map((u) => ({
            id: u.id,
            email: u.email,
            password: u.password,
            name: u.name,
            username: u.username,
            displayName: u.displayName,
            bio: u.bio,
            theme: u.theme,
            isPro: u.isPro,
            onboardingCompleted: u.onboardingCompleted,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          }));

          localStorage.setItem("users", JSON.stringify(essentialUsers));
          console.log("✅ Saved essential users data successfully");
        } catch (retryError) {
          console.error("❌ Retry also failed:", retryError);
          throw new Error(
            "Failed to save profile data. Storage might be full."
          );
        }
      }

      // COMPREHENSIVE VERIFICATION
      console.log("🔍 Starting verification process...");

      try {
        const verifyUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const verifyUser = verifyUsers.find(
          (u) => u.username === profileData.username
        );

        if (verifyUser) {
          console.log("✅ VERIFICATION SUCCESSFUL");
          console.log("👤 Found user with username:", verifyUser.username);
          console.log(
            "🎯 Onboarding completed:",
            verifyUser.onboardingCompleted
          );
          console.log("💎 Pro status:", verifyUser.isPro);
          console.log("🎨 Theme:", verifyUser.theme);
          console.log("📧 Email:", verifyUser.email);
          console.log("🆔 ID:", verifyUser.id);
        } else {
          console.error("❌ VERIFICATION FAILED - User not found after save");
          console.log("🔍 Looking for username:", profileData.username);
          console.log(
            "📋 Available usernames:",
            verifyUsers.map((u) => u.username).filter(Boolean)
          );

          // Try to fix by finding and updating the user again
          const userByEmail = verifyUsers.find(
            (u) => u.email === currentUser.email
          );
          if (userByEmail) {
            console.log("🔧 Found user by email, updating username...");
            userByEmail.username = profileData.username;
            userByEmail.onboardingCompleted = true;
            userByEmail.isPro = profileData.isPro;
            localStorage.setItem("users", JSON.stringify(verifyUsers));
            console.log("✅ Fixed user data");
          }
        }
      } catch (verifyError) {
        console.error("❌ Verification process failed:", verifyError);
      }

      // Update auth context
      if (updateUser && typeof updateUser === "function") {
        try {
          updateUser(updateData);
          console.log("✅ Updated auth context");
        } catch (contextError) {
          console.error("❌ Failed to update auth context:", contextError);
        }
      }

      // Save initial links
      const enabledLinks = initialLinks.filter(
        (link) => link.enabled && link.url.trim()
      );

      if (enabledLinks.length > 0) {
        try {
          const userLinksKey = `links_${currentUser.id || currentUser.email}`;
          const linksToSave = enabledLinks.map((link, index) => ({
            id: Date.now() + index,
            userId: currentUser.id || currentUser.email,
            title: link.title,
            url: link.url,
            type: link.type,
            description: `My ${link.title} profile`,
            clicks: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
          }));

          localStorage.setItem(userLinksKey, JSON.stringify(linksToSave));
          console.log(
            `✅ Saved ${linksToSave.length} initial links to ${userLinksKey}`
          );
        } catch (linksError) {
          console.error("❌ Failed to save links:", linksError);
          // Don't fail the whole process for this
        }
      }

      console.log("🎉 Onboarding completed successfully!");
      console.log(
        "🔗 Profile should be available at: /profile/" + profileData.username
      );

      // Final verification before navigation
      const finalUser = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("🏁 Final user state:", {
        username: finalUser.username,
        onboardingCompleted: finalUser.onboardingCompleted,
        isPro: finalUser.isPro,
      });

      navigate("/dashboard?welcome=true");
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
      console.error("❌ Error stack:", error.stack);

      setError(
        error.message ||
          "Setup completed but with some limitations. You can continue to dashboard."
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Up Your Profile
        </h2>
        <p className="text-gray-600">Create your unique LinkAfrika profile</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Your Username *
          </label>
          <div className="relative">
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9_-]/g, "");
                setProfileData({ ...profileData, username: value });
              }}
              placeholder="yourusername"
              className={`w-full p-3 pl-32 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                usernameStatus.available === false
                  ? "border-red-300"
                  : usernameStatus.available === true
                  ? "border-green-300"
                  : "border-gray-300"
              }`}
            />
            <div className="absolute left-3 top-3 text-gray-500 text-sm">
              linkafrika.com/
            </div>
            {usernameStatus.checking && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {usernameStatus.message && (
            <p
              className={`text-xs mt-1 ${
                usernameStatus.available ? "text-green-600" : "text-red-600"
              }`}
            >
              {usernameStatus.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            3+ characters, letters, numbers, _ and - only
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={profileData.displayName}
            onChange={(e) =>
              setProfileData({ ...profileData, displayName: e.target.value })
            }
            placeholder="Your full name or brand"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (Optional)
          </label>
          <textarea
            rows="3"
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
            placeholder="Tell people what you do... 📸 Photographer | 🎨 Creator"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <LinkIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Add Your First Links
        </h2>
        <p className="text-gray-600">
          Start with your most important social profiles
        </p>
      </div>

      <div className="space-y-3">
        {initialLinks.map((link, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={link.enabled}
                onChange={(e) => {
                  const newLinks = [...initialLinks];
                  newLinks[index].enabled = e.target.checked;
                  setInitialLinks(newLinks);
                }}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="font-medium text-gray-900">{link.title}</span>
            </div>

            {link.enabled && (
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...initialLinks];
                  newLinks[index].url = e.target.value;
                  setInitialLinks(newLinks);
                }}
                placeholder={`Your ${link.title} URL`}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 Don't worry, you can add more links and customize everything later
          in your dashboard!
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Theme
        </h2>
        <p className="text-gray-600">Pick a style that represents your brand</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setProfileData({ ...profileData, theme: theme.id })}
            className={`p-4 rounded-lg border-2 transition-all ${
              profileData.theme === theme.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-full h-24 bg-gradient-to-r ${theme.preview} rounded-lg mb-3`}
            />
            <div className="text-sm font-medium text-gray-900">
              {theme.name}
            </div>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
        <div className="text-center">
          <div
            className={`w-16 h-16 bg-gradient-to-r ${
              themes.find((t) => t.id === profileData.theme)?.preview
            } rounded-full mx-auto mb-3 flex items-center justify-center`}
          >
            <span className="text-white font-bold">
              {profileData.displayName.charAt(0) || "U"}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900">
            {profileData.displayName || "Your Name"}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {profileData.bio || "Your bio will appear here"}
          </p>

          {/* Show preview links */}
          <div className="mt-4 space-y-2">
            {initialLinks
              .filter((link) => link.enabled && link.url)
              .slice(0, 2)
              .map((link, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg bg-gradient-to-r ${
                    themes.find((t) => t.id === profileData.theme)?.preview
                  } text-white text-sm`}
                >
                  {link.title}
                </div>
              ))}
            {initialLinks.filter((link) => link.enabled && link.url).length >
              2 && (
              <div className="text-xs text-gray-500">
                +
                {initialLinks.filter((link) => link.enabled && link.url)
                  .length - 2}{" "}
                more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Almost Done! 🎉
        </h2>
        <p className="text-gray-600">
          Choose your plan and start growing your audience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <button
          onClick={() => setProfileData({ ...profileData, isPro: false })}
          className={`border-2 rounded-lg p-6 transition-all text-left ${
            !profileData.isPro
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Free Forever
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">₦0</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Up to 3 links
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Basic customization
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Mobile optimized
              </li>
            </ul>
            {!profileData.isPro && (
              <div className="inline-flex items-center text-orange-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Selected
              </div>
            )}
          </div>
        </button>

        {/* Pro Plan */}
        <button
          onClick={() => setProfileData({ ...profileData, isPro: true })}
          className={`border-2 rounded-lg p-6 transition-all text-left relative ${
            profileData.isPro
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-orange-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              7-Day Free Trial
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pro Creator
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">₦3,000</div>
            <div className="text-sm text-gray-500 mb-4">per month</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Unlimited links
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Sell digital products
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Custom domain
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Advanced analytics
              </li>
            </ul>
            {profileData.isPro && (
              <div className="inline-flex items-center text-orange-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Selected
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Show summary of what will be created */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          What we'll create for you:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Profile: linkafrika.com/{profileData.username}</li>
          <li>
            ✅ Theme: {themes.find((t) => t.id === profileData.theme)?.name}
          </li>
          <li>✅ Plan: {profileData.isPro ? "Pro Creator" : "Free Forever"}</li>
          {initialLinks.filter((link) => link.enabled && link.url).length >
            0 && (
            <li>
              ✅{" "}
              {initialLinks.filter((link) => link.enabled && link.url).length}{" "}
              initial links
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-gray-500">
              {Math.round((currentStep / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={
                isLoading ||
                (currentStep === 1 && usernameStatus.available !== true)
              }
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {currentStep === 4
                      ? profileData.isPro
                        ? "Start Pro Trial"
                        : "Complete Setup"
                      : "Continue"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip option */}
          {currentStep < 4 && (
            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Start Your Pro Trial
            </h3>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">LinkAfrika Pro</span>
                <span className="font-bold">₦3,000/month</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  7-day free trial
                </span>
                <span> • Cancel anytime</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => processPayment("paystack")}
                disabled={processingPayment}
                className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {processingPayment ? "Processing..." : "Pay with Paystack"}
                </span>
              </button>

              <button
                onClick={() => processPayment("bank")}
                disabled={processingPayment}
                className="w-full flex items-center justify-center space-x-3 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Smartphone className="w-5 h-5" />
                <span>
                  {processingPayment ? "Processing..." : "Bank Transfer"}
                </span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setProfileData({ ...profileData, isPro: false });
                }}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Continue with Free plan instead
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
