import { apiClient } from "./client";

// Send OTP
export interface SendOTPPayload {
  phone: string;
}

export interface SendOTPResponse {
  message?: string;
}

export const sendOTP = async (phone: string): Promise<SendOTPResponse> => {
  const response = await apiClient.post<SendOTPResponse>("/auth/send-otp", {
    phone,
  });
  return response.data;
};

// Login with OTP
export interface LoginPayload {
  phone: string;
  otp: string;
  name: string;
}

export interface LoginResponse {
  token: string; // This is the auth token
  message: string; // "Customer logged in successfully"
}

export const login = async (
  phone: string,
  otp: string,
  name?: string
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/verify-otp", {
    phone,
    otp,
    name,
  });
  return response.data;
};

// Get current user info
export interface ProfileResponse {
  id: string;
  name: string;
  avatar_url: string;
  isKids: boolean;
  pin?: string;
  hasPin?: boolean;
  createdAt: string;
}

export interface GetUserResponse {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  profiles?: ProfileResponse[];
}

export const getCurrentUser = async (): Promise<GetUserResponse> => {
  const response = await apiClient.get<any>("/auth/user");
  const backendUser = response.data.user;

  // Map backend field names to frontend format
  const userData: GetUserResponse = {
    id: backendUser.id,
    phone: backendUser.phone,
    name: backendUser.name,
    avatar: backendUser.avatar || "",
    createdAt: backendUser.created_at || new Date().toISOString(),
    profiles: [],
  };

  // Fetch profiles separately from /profiles endpoint
  try {
    const { getProfiles } = await import("./profiles");
    const profiles = await getProfiles();
    userData.profiles = profiles;
  } catch (error) {
    userData.profiles = [];
  }
  return userData;
};

// Logout
export interface LogoutResponse {
  message?: string;
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>("/auth/logout");
  return response.data;
};
