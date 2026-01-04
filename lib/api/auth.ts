import { apiClient } from './client';

// Request OTP
export interface RequestOTPPayload {
  mobile: string;
}

export interface RequestOTPResponse {
  message?: string;
}

export const requestOTP = async (mobile: string): Promise<RequestOTPResponse> => {
  const response = await apiClient.post<RequestOTPResponse>('/auth/request-otp', {
    mobile,
  });
  return response.data;
};

// Login with OTP
export interface LoginPayload {
  mobile: string;
  otp: string;
}

export interface LoginResponse {
  data: string; // This is the auth token
  message: string; // "Customer logged in successfully"
}

export const login = async (mobile: string, otp: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    mobile,
    otp,
  });
  return response.data;
};

// Get current user info (if needed)
export interface ProfileResponse {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  passcode?: string;
  createdAt: string;
}

export interface GetUserResponse {
  id: string;
  mobile: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  profiles?: ProfileResponse[];
}

export const getCurrentUser = async (): Promise<GetUserResponse> => {
  const response = await apiClient.get<GetUserResponse>('/user/profile');
  return response.data;
};

// Profile management
export interface CreateProfilePayload {
  name: string;
  avatar: string;
  isKids: boolean;
  passcode?: string;
}

export const createProfile = async (payload: CreateProfilePayload): Promise<ProfileResponse> => {
  const response = await apiClient.post<ProfileResponse>('/user/profiles', payload);
  return response.data;
};

export const updateProfile = async (profileId: string, payload: Partial<CreateProfilePayload>): Promise<ProfileResponse> => {
  const response = await apiClient.put<ProfileResponse>(`/user/profiles/${profileId}`, payload);
  return response.data;
};

export const deleteProfile = async (profileId: string): Promise<void> => {
  await apiClient.delete(`/user/profiles/${profileId}`);
};

export const verifyProfilePasscode = async (profileId: string, passcode: string): Promise<boolean> => {
  const response = await apiClient.post<{ valid: boolean }>(`/user/profiles/${profileId}/verify-passcode`, { passcode });
  return response.data.valid;
};
