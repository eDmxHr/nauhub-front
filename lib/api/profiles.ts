import { apiClient } from "./client";
import Cookies from "js-cookie";

// Backend API response type (matches Laravel API)
interface ProfileApiResponse {
  id: number;
  user_id: number;
  name: string;
  avatar: string | null;
  is_kids_profile: boolean;
  pin?: string | null;
  has_pin?: boolean;
  created_at: string;
  updated_at: string;
}

// Frontend Profile type (camelCase)
export interface ProfileResponse {
  id: string;
  name: string;
  avatar_url: string;
  isKids: boolean;
  pin?: string;
  hasPin?: boolean;
  createdAt: string;
}

// Helper function to map backend response to frontend type
function mapProfileResponse(apiProfile: ProfileApiResponse): ProfileResponse {
  return {
    id: String(apiProfile.id),
    name: apiProfile.name || "", // Ensure name is never null/undefined
    avatar_url: apiProfile.avatar || "red", // Default to "red" if null
    isKids: apiProfile.is_kids_profile,
    pin: apiProfile.pin || undefined, // PIN value (if provided by backend)
    hasPin: apiProfile.has_pin || false, // Use has_pin boolean from backend
    createdAt: apiProfile.created_at,
  };
}

export interface CreateProfilePayload {
  name: string;
  avatar_url: string;
  isKids: boolean;
  pin?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar_url?: string;
  isKids?: boolean;
  pin?: string;
}

export interface VerifyPinResponse {
  verified: boolean;
  profile: ProfileResponse;
}

// Get all profiles for the authenticated user
export const getProfiles = async (): Promise<ProfileResponse[]> => {
  const response = await apiClient.get<{ profiles: ProfileApiResponse[] }>(
    "/profiles"
  );
  return response.data.profiles.map(mapProfileResponse);
};

// Get a specific profile
export const getProfile = async (
  profileId: string
): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileApiResponse>(
    `/profiles/${profileId}`
  );
  return mapProfileResponse(response.data);
};

// Create a new profile
export const createProfile = async (
  payload: CreateProfilePayload
): Promise<ProfileResponse> => {
  // Map frontend payload to backend format
  const backendPayload = {
    name: payload.name,
    avatar: payload.avatar_url,
    is_kids_profile: payload.isKids,
    pin: payload.pin,
  };

  const response = await apiClient.post<ProfileApiResponse>(
    "/profiles",
    backendPayload
  );
  return mapProfileResponse(response.data);
};

// Update a profile
export const updateProfile = async (
  profileId: string,
  payload: UpdateProfilePayload
): Promise<ProfileResponse> => {
  // Map frontend payload to backend format
  const backendPayload: Record<string, any> = {};
  if (payload.name !== undefined) backendPayload.name = payload.name;
  if (payload.avatar_url !== undefined)
    backendPayload.avatar = payload.avatar_url;
  if (payload.isKids !== undefined)
    backendPayload.is_kids_profile = payload.isKids;
  if (payload.pin !== undefined) backendPayload.pin = payload.pin;

  const response = await apiClient.put<ProfileApiResponse>(
    `/profiles/${profileId}`,
    backendPayload
  );
  return mapProfileResponse(response.data);
};

// Delete a profile
export const deleteProfile = async (profileId: string): Promise<void> => {
  await apiClient.delete(`/profiles/${profileId}`);
};

// Verify profile PIN/passcode
export const verifyProfilePin = async (
  profileId: string,
  pin: string
): Promise<VerifyPinResponse> => {
  // Get token from cookie to include in payload
  const token = Cookies.get("auth_token");
  
  const response = await apiClient.post<{
    verified: boolean;
    profile: ProfileApiResponse;
  }>(`/profiles/${profileId}/verify-pin`, { 
    pin,
    token: token || "", // Include token in payload as required by API
  });

  return {
    verified: response.data.verified,
    profile: mapProfileResponse(response.data.profile),
  };
};
