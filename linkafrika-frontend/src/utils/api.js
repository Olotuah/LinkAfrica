import axios from "axios";

// 🔹 Use one env var name consistently across the app
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://linkafrica.onrender.com/api";

// 🔐 Private axios instance (uses token)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach the SAME token key your AuthContext uses: "token"
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ⬅️ IMPORTANT

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Just pass errors through for now
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// 🌐 Separate public/auth client (NO auth header by default)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================
   AUTH API (public client)
   =========================== */
export const authAPI = {
  register: (userData) => publicApi.post("/auth/register", userData),
  login: (credentials) => publicApi.post("/auth/login", credentials),
  checkUsername: (username) =>
    publicApi.post("/auth/check-username", { username }),
  // This one needs auth, so use the private client
  getMe: () => api.get("/auth/me"),
};

/* ===========================
   USER API (private)
   =========================== */
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (profileData) => api.put("/user/profile", profileData),
};

/* ===========================
   LINKS API (private)
   =========================== */
export const linksAPI = {
  getLinks: () => api.get("/links"),
  createLink: (linkData) => api.post("/links", linkData),
  updateLink: (id, linkData) => api.put(`/links/${id}`, linkData),
  deleteLink: (id) => api.delete(`/links/${id}`),
};

/* ===========================
   ANALYTICS API (private)
   =========================== */
export const analyticsAPI = {
  trackEvent: (eventData) => api.post("/analytics/track", eventData),
  getStats: (days = 30) => api.get(`/analytics/stats?days=${days}`),
};

/* ===========================
   PUBLIC API (no auth)
   =========================== */
export const publicAPI = {
  getProfile: (username) => publicApi.get(`/public/${username}`),
  trackClick: (linkId) => publicApi.post(`/public/click/${linkId}`),
};

export default api;
