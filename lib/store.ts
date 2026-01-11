import { create } from "zustand";
import Cookies from "js-cookie";
import { User, Profile } from "./types";
import { getProfiles } from "./api/profiles";

interface AuthStore {
  // State
  user: User | null;
  activeProfile: Profile | null;
  showProfileSelector: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;

  // Profile actions
  setActiveProfile: (profile: Profile | null) => void;
  setShowProfileSelector: (show: boolean) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (profileId: string) => void;

  // Fetch and update user profiles from API
  fetchProfiles: () => Promise<void>;

  // Utility actions
  clearError: () => void;
}

// Cookie configuration
const cookieOptions = {
  path: "/",
  expires: 30,
  sameSite: "Lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state
  user: null,
  activeProfile: null,
  showProfileSelector: false,
  isLoading: false,
  isInitialized: false, // Track if initialization has completed
  error: null,

  // Initialize auth state from cookies
  initialize: async () => {
    const token = getAuthToken();
    const profileId = getActiveProfileId();

    if (!token) {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const apiProfiles = await getProfiles();
      const mappedProfiles = apiProfiles.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar_url,
        isKids: p.isKids,
        pin: p.pin,
        createdAt: new Date(p.createdAt),
      }));

      // Construct minimal user object - adjust based on your needs
      const userData: User = {
        token,
        profiles: mappedProfiles,
        // Add other user fields as needed
      } as User;

      // Restore active profile if exists
      let restoredProfile: Profile | null = null;
      if (profileId && mappedProfiles.length > 0) {
        const profile = mappedProfiles.find((p) => p.id === profileId);
        if (profile) {
          restoredProfile = profile;
        } else {
          // Profile ID in cookie doesn't exist anymore, clear it
          Cookies.remove("active_profile", { path: "/" });
        }
      }

      set({
        user: userData,
        activeProfile: restoredProfile,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      // Token invalid or network error, clear cookies
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("active_profile", { path: "/" });
      set({
        user: null,
        activeProfile: null,
        isLoading: false,
        isInitialized: true,
        error:
          error instanceof Error ? error.message : "Failed to initialize auth",
      });
    }
  },

  // Auth actions
  login: (user) => {
    // Store token in cookie
    Cookies.set("auth_token", user.token, cookieOptions);

    set({
      user,
      error: null,
    });
  },

  logout: () => {
    // Remove tokens from cookies
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("active_profile", { path: "/" });

    set({
      user: null,
      activeProfile: null,
      showProfileSelector: false,
      error: null,
    });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsInitialized: (initialized) => set({ isInitialized: initialized }),

  // Profile actions
  setActiveProfile: (profile) => {
    if (profile) {
      Cookies.set("active_profile", profile.id, cookieOptions);
    } else {
      Cookies.remove("active_profile", { path: "/" });
    }

    set({
      activeProfile: profile,
      showProfileSelector: false,
    });
  },

  setShowProfileSelector: (show) => {
    set({ showProfileSelector: show });
  },

  addProfile: (profile) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            profiles: [...(state.user.profiles || []), profile],
          }
        : null,
    })),

  updateProfile: (profileId, updates) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            profiles: state.user.profiles?.map((p) =>
              p.id === profileId ? { ...p, ...updates } : p
            ),
          }
        : null,
      activeProfile:
        state.activeProfile?.id === profileId
          ? { ...state.activeProfile, ...updates }
          : state.activeProfile,
    })),

  deleteProfile: (profileId) =>
    set((state) => {
      const shouldClearActiveProfile = state.activeProfile?.id === profileId;

      // If deleting active profile, clear the cookie
      if (shouldClearActiveProfile) {
        Cookies.remove("active_profile", { path: "/" });
      }

      return {
        user: state.user
          ? {
              ...state.user,
              profiles: state.user.profiles?.filter((p) => p.id !== profileId),
            }
          : null,
        activeProfile: shouldClearActiveProfile ? null : state.activeProfile,
      };
    }),

  // Fetch and update user profiles from API
  fetchProfiles: async () => {
    const { user, activeProfile } = get();
    if (!user) {
      throw new Error("User must be logged in to fetch profiles");
    }

    set({ isLoading: true, error: null });

    try {
      const apiProfiles = await getProfiles();

      // Map API profiles to local Profile type
      const mappedProfiles = apiProfiles.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar_url,
        isKids: p.isKids,
        pin: p.pin,
        hasPin: p.hasPin,
        createdAt: new Date(p.createdAt),
      }));

      // Update active profile with fresh data if it exists
      const updatedActiveProfile = activeProfile
        ? mappedProfiles.find((p) => p.id === activeProfile.id) || null
        : null;

      // If active profile was deleted, clear the cookie
      if (activeProfile && !updatedActiveProfile) {
        Cookies.remove("active_profile", { path: "/" });
      }

      set((state) => ({
        user: state.user ? { ...state.user, profiles: mappedProfiles } : null,
        activeProfile: updatedActiveProfile,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch profiles";

      console.error("Failed to fetch profiles:", err);

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw err; // Re-throw so caller can handle if needed
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
}));

// Helper to get token from cookie (for middleware and client)
export function getAuthToken(): string | null {
  return Cookies.get("auth_token") || null;
}

// Helper to get active profile ID from cookie
export function getActiveProfileId(): string | null {
  return Cookies.get("active_profile") || null;
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
