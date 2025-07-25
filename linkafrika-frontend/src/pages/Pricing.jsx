import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Check,
  X,
  Crown,
  Zap,
  Building2,
  ArrowRight,
  Users,
  Globe,
  BarChart3,
  Shield,
  Headphones,
  Star,
  Clock,
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showComingSoon, setShowComingSoon] = useState(false);

  const plans = {
    free: {
      name: "Free Forever",
      price: 0,
      yearlyPrice: 0,
      icon: <Globe className="w-8 h-8" />,
      color: "from-gray-500 to-gray-600",
      popular: false,
      features: [
        "Up to 3 links",
        "Basic customization",
        "Mobile optimized",
        "Basic analytics",
        "LinkAfrika branding",
      ],
      limitations: [
        "Limited to 3 links",
        "No custom domain",
        "Basic themes only",
        "Standard support",
      ],
    },
    pro: {
      name: "Pro Creator",
      price: 3000,
      yearlyPrice: 30000,
      icon: <Crown className="w-8 h-8" />,
      color: "from-orange-500 to-green-500",
      popular: true,
      features: [
        "Unlimited links",
        "Sell digital products",
        "Advanced analytics",
        "Custom themes",
        "Remove LinkAfrika branding",
        "Priority support",
        "QR code generator",
        "Custom domain (Coming Q2 2025)",
        "Email marketing integration (Coming Q2 2025)",
        "Social media scheduler (Coming Q2 2025)",
      ],
      limitations: [],
    },
    business: {
      name: "Business Team",
      price: 10000,
      yearlyPrice: 100000,
      icon: <Building2 className="w-8 h-8" />,
      color: "from-purple-500 to-blue-500",
      popular: false,
      comingSoon: true,
      features: [
        "Everything in Pro",
        "Team management (up to 10 users)",
        "Advanced team analytics",
        "White-label solution",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Enterprise-grade security",
        "Advanced automations",
        "Custom reporting",
      ],
      limitations: [],
    },
  };

  const handlePlanSelect = (planType) => {
    if (planType === "business") {
      setShowComingSoon(true);
      return;
    }

    if (!isAuthenticated) {
      localStorage.setItem("selectedPlan", planType);
      navigate("/signup");
      return;
    }

    if (planType === "free") {
      if (!user?.isPro) {
        alert("You're already on the Free plan!");
        return;
      }
      alert("Contact support to downgrade your plan.");
      return;
    }

    if (planType === "pro") {
      alert("Redirecting to payment... (This would integrate with Paystack)");
    }
  };

  const PlanCard = ({ plan, planType }) => (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
        plan.popular
          ? "border-orange-500 transform scale-105"
          : plan.comingSoon
          ? "border-gray-300 opacity-75"
          : "border-gray-200"
      } transition-all duration-300 hover:shadow-xl`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-orange-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Most Popular</span>
          </span>
        </div>
      )}

      {plan.comingSoon && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Coming Soon</span>
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}
        >
          {plan.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="mb-4">
          {billingCycle === "monthly" ? (
            <>
              <span className="text-4xl font-bold text-gray-900">
                ₦{plan.price.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-2">/month</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-bold text-gray-900">
                ₦{plan.yearlyPrice.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-2">/year</span>
              <div className="text-lg text-gray-600 mt-1">
                (₦{Math.floor(plan.yearlyPrice / 12).toLocaleString()}/month)
              </div>
            </>
          )}
        </div>
        {billingCycle === "yearly" && plan.price > 0 && (
          <div className="text-sm text-green-600 font-medium">
            Save ₦{(plan.price * 12 - plan.yearlyPrice).toLocaleString()} yearly!
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
          Features included:
        </h4>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        {plan.limitations.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">
              Limitations:
            </h4>
            <ul className="space-y-2">
              {plan.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm">{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => handlePlanSelect(planType)}
        disabled={plan.comingSoon}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          plan.popular
            ? "bg-gradient-to-r from-orange-600 to-green-600 text-white hover:from-orange-700 hover:to-green-700 transform hover:scale-105"
            : plan.comingSoon
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : planType === "free"
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        <span>
          {plan.comingSoon
            ? "Notify Me"
            : planType === "free"
            ? "Get Started Free"
            : user?.isPro && planType === "pro"
            ? "Current Plan"
            : `Start ${plan.name}`}
        </span>
        {!plan.comingSoon && <ArrowRight className="w-5 h-5" />}
      </button>

      {planType === "pro" && (
        <p className="text-center text-sm text-gray-500 mt-3">
          7-day free trial • Cancel anytime
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free, upgrade when you're ready to grow
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`${
                billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${
                billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Yearly
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Save 17%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PlanCard plan={plans.free} planType="free" />
          <PlanCard plan={plans.pro} planType="pro" />
          <PlanCard plan={plans.business} planType="business" />
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Growing?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join Nigerian creators building their online presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handlePlanSelect("free")}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Today
            </button>
            <button
              onClick={() => handlePlanSelect("pro")}
              className="bg-black/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-black/30 transition-colors border border-white/20"
            >
              Try Pro Free for 7 Days
            </button>
          </div>
        </div>

        {showComingSoon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Business Plan Coming Soon! 🚀
              </h2>
              <p className="text-gray-600 mb-6">
                Our Business plan with team management, API access, and
                enterprise features is launching in Q2 2025.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    alert(
                      "Thanks! We'll notify you when Business plan launches."
                    );
                    setShowComingSoon(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  Join Waitlist
                </button>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Waitlist members get early access and special pricing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;