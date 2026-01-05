export const AVATAR_OPTIONS = [
  { id: "red", color: "bg-red-500" },
  { id: "blue", color: "bg-blue-500" },
  { id: "green", color: "bg-green-500" },
  { id: "yellow", color: "bg-yellow-500" },
  { id: "purple", color: "bg-purple-500" },
  { id: "pink", color: "bg-pink-500" },
  { id: "orange", color: "bg-orange-500" },
  { id: "teal", color: "bg-teal-500" },
];

export const getAvatarColor = (
  avatarId: string | undefined,
  fallbackIndex = 0
) => {
  const option = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return (
    option?.color || AVATAR_OPTIONS[fallbackIndex % AVATAR_OPTIONS.length].color
  );
};

export const isColorAvatar = (avatarId: string | undefined) => {
  return !!AVATAR_OPTIONS.find((a) => a.id === avatarId);
};
