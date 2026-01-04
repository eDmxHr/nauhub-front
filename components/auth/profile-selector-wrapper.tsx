"use client";

import { useState } from "react";
import { ProfileSelector } from "./profile-selector";
import { ProfileManagement } from "./profile-management";

export function ProfileSelectorWrapper() {
  const [showManagement, setShowManagement] = useState(false);

  return (
    <>
      <ProfileSelector onManageProfiles={() => setShowManagement(true)} />
      <ProfileManagement
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
      />
    </>
  );
}
