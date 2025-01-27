"use client";

interface ProfileSectionProps {
  isOpen: boolean;
  userData: {
    name: string;
    email: string;
  } | null;
}

const ProfileSection = ({ isOpen, userData }: ProfileSectionProps) => {
  if (!userData) {
    return (
      <div className="flex-1">
        <h4 className="font-semibold text-gray-400">Not logged in</h4>
      </div>
    );
  }

  return (
    <div className="flex gap-x-4 items-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#00F5A0] flex items-center justify-center">
        <span className="text-xl font-bold">{userData.name[0].toUpperCase()}</span>
      </div>
      <div className={`${!isOpen && "hidden"} origin-left duration-300`}>
        <h4 className="font-semibold">{userData.name}</h4>
        <p className="text-xs text-gray-400">Points: 1,234 ⭐</p>
      </div>
    </div>
  );
};

export default ProfileSection;
