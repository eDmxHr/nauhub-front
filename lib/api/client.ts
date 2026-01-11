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
    
    // If data is FormData, remove Content-Type to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
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
          // Unauthorized - only clear token if it's an auth-related endpoint
          // For browsing endpoints, 401 is expected for unauthenticated users
          // Only clear token for user-specific endpoints to avoid clearing valid tokens
          const requestUrl = error.config?.url || "";
          // Don't clear token for PIN verification - wrong PIN doesn't mean invalid token
          const isPinVerification = requestUrl.includes("/verify-pin");
          const isAuthEndpoint = 
            requestUrl.includes("/auth/") || 
            (requestUrl.includes("/profiles") && !isPinVerification) ||
            requestUrl.includes("/watch-history") ||
            requestUrl.includes("/playlists");
          
          if (isAuthEndpoint) {
            // Only clear token if we have one (it might be invalid)
            const token = Cookies.get("auth_token");
            if (token) {
              Cookies.remove("auth_token", { path: "/" });
            }
          }
          // For browsing endpoints and PIN verification, don't clear token - just let the error propagate
          // so components can handle it gracefully
          break;
        case 422:
          // Validation error - return the error message
          break;
        default:
          // Only log non-401 errors to avoid noise
          if (error.response.status !== 404) {
            console.error("API Error:", error.response.data);
          }
      }
    } else if (error.request) {
      // Network error
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);
