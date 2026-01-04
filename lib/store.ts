import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User, Profile } from './types';

interface AuthStore {
  // State
  user: User | null;
  activeProfile: Profile | null;
  showProfileSelector: boolean;
  
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Profile actions
  setActiveProfile: (profile: Profile | null) => void;
  setShowProfileSelector: (show: boolean) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (profileId: string) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  // Initial state
  user: null,
  activeProfile: null,
  showProfileSelector: false,
  
  // Auth actions
  login: (user) => {
    // Store token in cookie
    Cookies.set('auth_token', user.token, { path: '/', expires: 30, sameSite: 'Lax' });
    set({ user, showProfileSelector: true });
  },
  logout: () => {
    // Remove token from cookie
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('active_profile', { path: '/' });
    set({ user: null, activeProfile: null, showProfileSelector: false });
  },
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  
  // Profile actions
  setActiveProfile: (profile) => {
    if (profile) {
      Cookies.set('active_profile', profile.id, { path: '/', expires: 30, sameSite: 'Lax' });
    }
    set({ activeProfile: profile, showProfileSelector: false });
  },
  setShowProfileSelector: (show) => set({ showProfileSelector: show }),
  addProfile: (profile) => set((state) => ({
    user: state.user ? {
      ...state.user,
      profiles: [...(state.user.profiles || []), profile]
    } : null
  })),
  updateProfile: (profileId, updates) => set((state) => ({
    user: state.user ? {
      ...state.user,
      profiles: state.user.profiles?.map(p => 
        p.id === profileId ? { ...p, ...updates } : p
      )
    } : null,
    activeProfile: state.activeProfile?.id === profileId 
      ? { ...state.activeProfile, ...updates } 
      : state.activeProfile
  })),
  deleteProfile: (profileId) => set((state) => ({
    user: state.user ? {
      ...state.user,
      profiles: state.user.profiles?.filter(p => p.id !== profileId)
    } : null,
    activeProfile: state.activeProfile?.id === profileId ? null : state.activeProfile
  })),
}));

// Helper to get token from cookie (for middleware and client)
export function getAuthToken(): string | null {
  return Cookies.get('auth_token') || null;
}

// Helper to get active profile ID from cookie
export function getActiveProfileId(): string | null {
  return Cookies.get('active_profile') || null;
}
