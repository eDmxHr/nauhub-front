"use client";

import { useState } from "react";
import { ProfileSelector } from "./profile-selector";
import { ProfileManagement } from "./profile-management";

export function ProfileSelectorWrapper() {
  const [showManagement, setShowManagement] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const handleCreateProfile = () => {
    setShowManagement(true);
    setIsCreatingProfile(true);
  };

  return (
    <>
      {!showManagement && (
        <ProfileSelector
          onManageProfiles={() => setShowManagement(true)}
          onCreateProfile={handleCreateProfile}
        />
      )}
      <ProfileManagement
        isOpen={showManagement}
        onClose={() => {
          setShowManagement(false);
          setIsCreatingProfile(false);
        }}
        initialCreateMode={isCreatingProfile}
      />
    </>
  );
}
