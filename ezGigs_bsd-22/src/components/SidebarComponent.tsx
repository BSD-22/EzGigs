"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ProfileSection from "./ProfileSection";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Ticket, Target, History, Crown, Star, Store, MessageCircle, Heart, ShoppingCart, ChevronLeft } from "lucide-react";

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
    <div className={`${isOpen ? "w-64" : "w-20"} bg-[#2C3228] backdrop-blur-xl border-r border-[#4A5043]/20 p-5 pt-20 relative duration-300 z-[100]`}>
      <div
        className="absolute cursor-pointer left-[26px] top-8 w-7 h-7 bg-[#4A5043] hover:bg-[#656D5D] rounded-full flex items-center justify-center transition-colors shadow-md"
        onClick={() => setIsOpen(!isOpen)}>
        <ChevronLeft className={`w-4 h-4 text-white transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} />
      </div>

      <div className="mt-4">
        <ProfileSection
          isOpen={isOpen}
          userData={userData}
        />

        {userData && isOpen && (
          <div className="mt-6 mb-4 px-2 py-1.5 bg-[#4A5043]/20 rounded-lg flex items-center gap-2 text-[#E8EDE1]">
            {getSubscriptionIcon(subscription)}
            <span className="capitalize text-sm">{subscription} Plan</span>
          </div>
        )}

        <ul className="pt-6">
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
                className={`flex items-center gap-x-4 p-2 rounded-lg transition-all duration-200 ${
                  pathname === item.href ? "bg-[#4A5043] text-white" : "text-[#E8EDE1] hover:bg-[#4A5043]/20 hover:text-white"
                }`}>
                {item.icon}
                <span className={`${!isOpen && "hidden"} origin-left duration-200`}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
