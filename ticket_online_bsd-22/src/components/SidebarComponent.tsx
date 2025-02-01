"use client";

import Link from "next/link";
import { useState } from "react";
import ProfileSection from "./ProfileSection";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface SideBarProps {
  userData: {
    name: string;
    email: string;
  } | null;
}

const SideBar = ({ userData }: SideBarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { subscription } = useSubscription();

  const getSubscriptionEmoji = (type: "free" | "premium" | "vip") => {
    switch (type) {
      case "vip":
        return "👑";
      case "premium":
        return "⭐";
      default:
        return "🆓";
    }
  };

  return (
    <div className={`${isOpen ? "w-64" : "w-20"} bg-[#2C3228] backdrop-blur-xl border-r border-[#4A5043]/20 p-5 pt-8 relative duration-300 z-[100]`}>
      <div
        className="absolute cursor-pointer -right-3 top-9 w-7 h-7 bg-[#4A5043] hover:bg-[#656D5D] rounded-full flex items-center justify-center transition-colors z-[101] shadow-lg"
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

      {userData && isOpen && (
        <div className="mt-2 px-2 py-1 bg-[#4A5043]/20 rounded-lg flex items-center gap-2 text-[#E8EDE1]">
          <span>{getSubscriptionEmoji(subscription)}</span>
          <span className="capitalize text-sm">{subscription} Plan</span>
        </div>
      )}

      {/* Rest of your navigation code stays the same */}
      <ul className="pt-6">
        <li className="mb-2">
          <Link
            href="/home/ticket"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">🎫</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Tickets</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/my-tickets"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">🎯</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Your Tickets</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/history"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">📜</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Sales History</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/subscription"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">⭐</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Subscription</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/marketplace"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">🏪</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Marketplace</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/chats"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">💬</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Chats</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/wishlist"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors">
            <span className="text-xl">💝</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Wishlist</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/home/cart"
            className="flex items-center gap-x-4 p-2 hover:bg-[#4A5043]/20 text-[#E8EDE1] hover:text-white rounded-lg transition-colors relative">
            <span className="text-xl">🛒</span>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>Cart</span>
            <span className="absolute -top-1 -right-1 bg-[#4A5043] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
