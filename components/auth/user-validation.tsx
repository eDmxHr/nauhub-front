"use client";

import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/api/auth";

export function UserValidation({ children }: { children: React.ReactNode }) {
  // Use ref to track if we've already initialized
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitializedRef.current) {
      return;
    }
    
    hasInitializedRef.current = true;

    const validateUser = async () => {
      // Get fresh store functions
      const { login, setActiveProfile, setShowProfileSelector, setIsLoading, setIsInitialized } = useAuthStore.getState();
      // Check if auth_token cookie exists using js-cookie
      const token = Cookies.get("auth_token");

      if (!token) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // If we have a token, we need to fetch user data
      // Set loading state immediately
      setIsLoading(true);

      try {
        // Fetch user data from API
        const userData = await getCurrentUser();

        // Map profiles correctly: avatar_url -> avatar
        const mappedProfiles = (userData.profiles || []).map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar_url, // Map avatar_url to avatar
          isKids: p.isKids,
          pin: p.pin,
          createdAt: new Date(p.createdAt),
        }));

        // Login user to store with API data
        login({
          id: userData.id,
          phone: userData.phone,
          name: userData.name,
          avatar: userData.avatar,
          token: token,
          createdAt: new Date(userData.createdAt),
          profiles: mappedProfiles,
        });

        // Check for active_profile cookie using js-cookie
        const activeProfileId = Cookies.get("active_profile");

        // Only deal with profiles if user actually has some
        if (mappedProfiles.length > 0) {
          if (activeProfileId) {
            const activeProfile = mappedProfiles.find(
              (p) => p.id === activeProfileId
            );

            if (activeProfile) {
              // If profile has pin, show selector for verification
              if (activeProfile.pin) {
                setShowProfileSelector(true);
              } else {
                setActiveProfile(activeProfile);
              }
            } else {
              // Show profile selector if saved profile not found
              setShowProfileSelector(true);
            }
          } else {
            // Show profile selector if no active profile saved
            setShowProfileSelector(true);
          }
        }
        // If no profiles exist, don't show selector - user can still use app
      } catch (error) {
        console.error('[UserValidation] Failed to validate user:', error);
        // Clear invalid token using js-cookie
        Cookies.remove("auth_token", { path: "/" });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    validateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps with ref guard is intentional

  // Don't block rendering, just validate in background
  return <>{children}</>;
}
