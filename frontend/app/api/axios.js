import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor: attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor: handle 401 (token expired/invalid)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem("token");

      // Try to get the logout function from context
      // Note: This is a workaround since we can't access context in interceptor
      // A better solution is to use the Axios instance directly in components

      // Redirect to login (check current path to avoid redirect loops)
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Handle 503 (service unavailable)
    if (error.response?.status === 503) {
      console.error("Service unavailable:", error.response.data?.message);
    }

    // Handle 429 (rate limited)
    if (error.response?.status === 429) {
      console.warn("Rate limited:", error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default API;