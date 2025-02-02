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
      <div className="min-w-[2.5rem] h-10 rounded-lg bg-[#4A5043] flex items-center justify-center">
        <span className="text-white font-medium text-xl">
          {userData.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className={`${!isOpen && "hidden"} origin-left duration-200`}>
        <h2 className="text-white font-semibold">
          {userData.name}
        </h2>
        <p className="text-[#D3D9C9] text-sm">
          {userData.email}
        </p>
      </div>
    </div>
  );
};

export default ProfileSection;
