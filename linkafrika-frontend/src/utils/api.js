import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://linkafrica.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("linkafrika_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 AND if it's not a login/register request
    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthRequest) {
        // Token expired or invalid for protected routes
        localStorage.removeItem("linkafrika_token");
        localStorage.removeItem("linkafrika_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Create a separate axios instance for auth requests (no interceptors)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API functions (using separate instance to avoid interceptor issues)
export const authAPI = {
  register: (userData) => authApi.post("/auth/register", userData),
  login: (credentials) => authApi.post("/auth/login", credentials),
  checkUsername: (username) =>
    authApi.post("/auth/check-username", { username }),
  getMe: () => api.get("/auth/me"), // This one can use the main api since it needs auth
};

// User API functions
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (profileData) => api.put("/user/profile", profileData),
};

// Links API functions
export const linksAPI = {
  getLinks: () => api.get("/links"),
  createLink: (linkData) => api.post("/links", linkData),
  updateLink: (id, linkData) => api.put(`/links/${id}`, linkData),
  deleteLink: (id) => api.delete(`/links/${id}`),
};

// Analytics API functions
export const analyticsAPI = {
  trackEvent: (eventData) => api.post("/analytics/track", eventData),
  getStats: (days = 30) => api.get(`/analytics/stats?days=${days}`),
};

// Public API functions
export const publicAPI = {
  getProfile: (username) => api.get(`/public/${username}`),
  trackClick: (linkId) => api.post(`/public/click/${linkId}`),
};

export default api;
