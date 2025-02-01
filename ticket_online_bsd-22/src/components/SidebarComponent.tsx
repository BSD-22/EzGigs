"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ProfileSection from "./ProfileSection";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Menu, Ticket, Target, History, Crown, Star, Store, MessageCircle, Heart, ShoppingCart } from "lucide-react";

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
    <div className={`${isOpen ? "w-64" : "w-20"} bg-zinc-900 backdrop-blur-xl border-r border-zinc-800 p-5 pt-14 relative duration-300`}>
      <div
        className="absolute cursor-pointer left-[26px] top-6 w-7 h-7 bg-[#4A5043] hover:bg-[#656D5D] rounded-full flex items-center justify-center transition-colors shadow-md"
        onClick={() => setIsOpen(!isOpen)}>
        <Menu className="w-4 h-4 text-white" />
      </div>

      <div className="mt-2">
        <ProfileSection
          isOpen={isOpen}
          userData={userData}
        />

        {userData && isOpen && (
          <div className="mt-4 mb-2 px-2 py-1.5 bg-zinc-800/50 rounded-lg flex items-center gap-2 text-zinc-200">
            {getSubscriptionIcon(subscription)}
            <span className="capitalize text-sm">{subscription} Plan</span>
          </div>
        )}

        <ul className="pt-4">
          {[
            { href: "/home/ticket", icon: <Ticket className="w-5 h-5" />, label: "Tickets" },
            { href: "/home/my-tickets", icon: <Target className="w-5 h-5" />, label: "Your Tickets" },
            { href: "/home/history", icon: <History className="w-5 h-5" />, label: "Sales History" },
            { href: "/home/subscription", icon: <Crown className="w-5 h-5" />, label: "Subscription" },
            { href: "/home/marketplace", icon: <Store className="w-5 h-5" />, label: "Marketplace" },
            { href: "/home/chats", icon: <MessageCircle className="w-5 h-5" />, label: "Chats" },
            { href: "/home/wishlist", icon: <Heart className="w-5 h-5" />, label: "Wishlist" },
            { href: "/home/cart", icon: <ShoppingCart className="w-5 h-5" />, label: "Cart", badge: "3" },
          ].map((item) => (
            <li
              key={item.href}
              className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center gap-x-4 p-2 rounded-lg transition-all duration-200 ${
                  pathname === item.href ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}>
                {item.icon}
                <span className={`${!isOpen && "hidden"} origin-left duration-200`}>{item.label}</span>
                {item.badge && <span className="absolute -top-1 -right-1 bg-zinc-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{item.badge}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
