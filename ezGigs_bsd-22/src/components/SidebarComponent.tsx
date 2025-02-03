"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Ticket, Target, History, Crown, Star, Store, MessageCircle, Heart, ShoppingCart, ChevronLeft } from "lucide-react";
import LogoutButton from "./LogoutButton";

interface SideBarProps {
  userData: {
    name: string;
    email: string;
  } | null;
}

const SideBar = ({ userData }: SideBarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { subscription } = useSubscription();
  const pathname = usePathname();

  const getSubscriptionIcon = (type: "free" | "premium" | "vip") => {
    switch (type) {
      case "vip":
        return <Crown className="w-5 h-5" />;
      case "premium":
        return <Star className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5 opacity-50" />;
    }
  };

  return (
    <div
      className={`
      ${isOpen ? "w-64" : "w-20"} 
      relative
      bg-[#0D0D0D]
      backdrop-blur-xl 
      border-r border-[#00D2FF]/20
      p-5 pt-20 
      duration-300 
      z-[40]
      overflow-hidden
    `}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] via-[#3A7BD5] to-transparent opacity-30 z-0"></div>
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#00D2FF] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#3A7BD5] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>

      {/* Toggle button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="absolute cursor-pointer left-[26px] top-8 w-7 h-7 
        bg-[#00D2FF]
        rounded-full flex items-center justify-center 
        transition-all duration-300
        hover:scale-110
        hover:brightness-110
        group
        z-20">
        <ChevronLeft
          className={`w-4 h-4 text-white 
          transition-all duration-300 
          group-hover:rotate-12
          ${!isOpen ? "rotate-180 group-hover:rotate-[192deg]" : ""}`}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Enhanced Profile Section */}
        <div className="relative z-20 mb-6">
          {isOpen ? (
            <div className="space-y-4">
              {/* Profile Info */}
              <div
                className="bg-white/5 rounded-xl p-3 backdrop-blur-sm
                border border-white/10 hover:border-[#00D2FF]/30
                transition-all duration-300
                group">
                <div className="flex items-center gap-3">
                  {/* Profile Initial */}
                  <div
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D2FF] to-[#3A7BD5]
                    flex items-center justify-center text-white font-semibold
                    shadow-lg shadow-[#00D2FF]/20
                    group-hover:scale-105 transition-transform duration-300">
                    {userData?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{userData?.name || "User"}</h3>
                    <p className="text-white/60 text-sm truncate">{userData?.email || "user@email.com"}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Badge */}
              <div
                className="bg-white/5 rounded-lg px-3 py-2
                border border-white/10 hover:border-[#00D2FF]/30
                transition-all duration-300
                flex items-center gap-2
                group">
                <div className="text-[#00D2FF] group-hover:scale-110 transition-transform duration-300">{getSubscriptionIcon(subscription)}</div>
                <span className="text-white/80 text-sm capitalize">{subscription} Plan</span>
              </div>
            </div>
          ) : (
            // Collapsed state
            <div className="flex justify-center">
              <div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D2FF] to-[#3A7BD5]
                flex items-center justify-center text-white font-semibold
                shadow-lg shadow-[#00D2FF]/20
                hover:scale-105 transition-transform duration-300">
                {userData?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <ul className="pt-4 relative z-20 border-t border-white/10">
          {[
            { href: "/home/ticket", icon: <Ticket className="w-5 h-5" />, label: "Tickets" },
            { href: "/home/my-tickets", icon: <Target className="w-5 h-5" />, label: "Your Tickets" },
            { href: "/home/history", icon: <History className="w-5 h-5" />, label: "Sales History" },
            { href: "/home/subscription", icon: <Crown className="w-5 h-5" />, label: "Subscription" },
            { href: "/home/marketplace", icon: <Store className="w-5 h-5" />, label: "Marketplace" },
            { href: "/home/chats", icon: <MessageCircle className="w-5 h-5" />, label: "Chats" },
            { href: "/home/wishlist", icon: <Heart className="w-5 h-5" />, label: "Wishlist" },
            { href: "/home/cart", icon: <ShoppingCart className="w-5 h-5" />, label: "Cart" },
          ].map((item) => (
            <li
              key={item.href}
              className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center gap-x-4 p-2 rounded-lg 
                  transition-all duration-300 
                  hover:scale-[1.02]
                  group
                  relative
                  ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-gradient-to-r from-[#00D2FF] to-[#3A7BD5] text-white shadow-[0_0_20px_-5px_#00D2FF]"
                      : "text-white/80 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_-5px_#00D2FF]"
                  }`}>
                <div className="transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                <span className={`${!isOpen && "hidden"} origin-left duration-200`}>{item.label}</span>
              </Link>
            </li>
          ))}
          <li className="mt-8">
            <LogoutButton isOpen={isOpen} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
