"use client";

import Link from "next/link";
import { useState } from "react";
import ProfileSection from "./ProfileSection";

interface SideBarProps {
  userData: {
    name: string;
    email: string;
  } | null;
}

const SideBar = ({ userData }: SideBarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`${isOpen ? "w-64" : "w-20"} bg-black/40 backdrop-blur-xl border-r border-[#8E2DE2]/20 p-5 pt-8 relative duration-300`}>
      <div
        className="absolute cursor-pointer -right-3 top-9 w-7 h-7 bg-[#8E2DE2] rounded-full flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>

      <ProfileSection
        isOpen={isOpen}
        userData={userData}
      />

      {/* Rest of your navigation code stays the same */}
      <ul className="pt-6">
        <li className="mb-2">
          <Link
            href="/home/ticket"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">🎫</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Tickets</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/my-tickets"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">🎯</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Your Tickets</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/history"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">📜</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Sales History</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/subscription"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">⭐</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Subscription</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/marketplace"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">🏪</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Marketplace</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/wishlist"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors">
            <span className="text-xl">💝</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Wishlist</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/cart"
            className="flex items-center gap-x-4 p-2 hover:bg-[#8E2DE2]/10 rounded-lg transition-colors relative">
            <span className="text-xl">🛒</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Cart</span>
            <span className="absolute -top-1 -right-1 bg-[#FF2D55] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
