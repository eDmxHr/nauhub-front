import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth cookie only if it exists
          // Don't redirect automatically, let each page handle auth its own way
          const token = Cookies.get("auth_token");
          if (token) {
            Cookies.remove("auth_token", { path: "/" });
          }
          break;
        case 422:
          // Validation error - return the error message
          break;
        default:
          console.error("API Error:", error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);
