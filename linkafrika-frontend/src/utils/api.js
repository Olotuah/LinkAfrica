import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://linkafrica.onrender.com/api";

// 🔹 Private axios instance (auto-attaches token)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 🔥 IMPORTANT: Use the SAME token your AuthContext stores ("token")
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // FIXED
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple error passthrough
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

// 🔹 Public axios (no auth header)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/* ============================
   AUTH (uses public API)
   ============================ */
export const authAPI = {
  register: (data) => publicApi.post("/auth/register", data),
  login: (data) => publicApi.post("/auth/login", data),
  checkUsername: (username) =>
    publicApi.post("/auth/check-username", { username }),
  getMe: () => api.get("/auth/me"), // needs token
};

/* ============================
   USER (private)
   ============================ */
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (profileData) => api.put("/user/profile", profileData),
};

/* ============================
   LINKS (private)
   ============================ */
export const linksAPI = {
  getLinks: () => api.get("/links"),
  createLink: (data) => api.post("/links", data),
  updateLink: (id, data) => api.put(`/links/${id}`, data),
  deleteLink: (id) => api.delete(`/links/${id}`),
};

/* ============================
   PRODUCTS (private)
   ============================ */

export const productsAPI = {
  getProducts: () => api.get("/products"),
  createProduct: (data) => api.post("/products", data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

/* ============================
   ANALYTICS (private)
   ============================ */
export const analyticsAPI = {
  trackEvent: (event) => api.post("/analytics/track", event),
  getStats: (days = 30) => api.get(`/analytics/stats?days=${days}`),
};

/* ============================
   PUBLIC ROUTES (no token)
   ============================ */
export const publicAPI = {
  getProfile: (username) => publicApi.get(`/public/${username}`),
  trackClick: (linkId) => publicApi.post(`/public/click/${linkId}`),
};

export default api;
