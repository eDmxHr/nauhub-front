"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/store";
import { Profile } from "@/lib/types";

// Fake profiles data for testing
const FAKE_PROFILES: Profile[] = [
  {
    id: "profile-1",
    name: "John",
    avatar: "",
    isKids: false,
    passcode: undefined,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "profile-2",
    name: "Sarah",
    avatar: "",
    isKids: false,
    passcode: "1234",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "profile-3",
    name: "Kids",
    avatar: "",
    isKids: true,
    passcode: undefined,
    createdAt: new Date("2024-03-01"),
  },
];

// Fake user data for testing
const FAKE_USER = {
  id: "user-123",
  mobile: "9123456",
  name: "Test User",
  avatar: "",
  createdAt: new Date("2024-01-01"),
  profiles: FAKE_PROFILES,
};

export function UserValidation({ children }: { children: React.ReactNode }) {
  const { user, login, setActiveProfile, setShowProfileSelector } =
    useAuthStore();
  const [, setIsValidating] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      // Check if auth_token cookie exists using js-cookie
      const token = Cookies.get("auth_token");

      if (!token) {
        setIsValidating(false);
        return;
      }

      // Skip if user is already loaded
      if (user) {
        setIsValidating(false);
        return;
      }

      try {
        // Use fake data since we don't have API
        const profiles = FAKE_PROFILES;

        // Login user to store with fake data
        login({
          ...FAKE_USER,
          token: token,
          profiles: profiles,
        });

        // Check for active_profile cookie using js-cookie
        const activeProfileId = Cookies.get("active_profile");

        if (activeProfileId) {
          const activeProfile = profiles.find((p) => p.id === activeProfileId);

          if (activeProfile) {
            // If profile has passcode, show selector for verification
            if (activeProfile.passcode) {
              setShowProfileSelector(true);
            } else {
              setActiveProfile(activeProfile);
            }
          } else if (profiles.length > 0) {
            // Show profile selector if saved profile not found
            setShowProfileSelector(true);
          }
        } else if (profiles.length > 0) {
          // Show profile selector if no active profile saved
          setShowProfileSelector(true);
        }
      } catch (error) {
        console.error("Failed to validate user:", error);
        // Clear invalid token using js-cookie
        Cookies.remove("auth_token", { path: "/" });
      } finally {
        setIsValidating(false);
      }
    };

    validateUser();
  }, [user, login, setActiveProfile, setShowProfileSelector]);

  // Don't block rendering, just validate in background
  return <>{children}</>;
}
