"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

const LayoutSeller = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const navItems = [
        {
            icon: "🏠",
            name: "Dashboard",
            path: "/seller",
        },
        {
            icon: "🎫",
            name: "All Tickets",
            path: "/seller/all-tickets",
        },
        {
            icon: "➕",
            name: "Create Ticket",
            path: "/seller/create-ticket",
        },
        
    ];

    return (
        <div className="flex min-h-screen bg-black">
            <div className={`relative ${isOpen ? "w-64" : "w-20"} bg-[#0D0D0D] backdrop-blur-xl border-r border-[#FF8008]/20 p-5 pt-20 duration-300 z-[40] overflow-hidden`}>
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF8008] via-[#FFA557] to-transparent opacity-30 z-0"></div>
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#FF8008] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#FFA557] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>

                {/* Toggle Button */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute cursor-pointer left-[26px] top-8 w-7 h-7 
                    bg-[#FF8008]
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
                    {/* Enhanced Title Section */}
                    <div className="relative z-20 mb-8">
                        {isOpen ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#FF8008] to-[#FFA557] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF8008]/20 mb-3">
                                    <Link href="/seller">
                                        <Image
                                            src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20size.png?updatedAt=1738307076179"
                                            alt="Logo"
                                            width={40} 
                                            height={40}
                                            className="object-contain"
                                        />
                                    </Link>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF8008] to-[#FFA557] bg-clip-text text-transparent">
                                    EzGigs
                                </h1>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#FF8008] to-[#FFA557] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF8008]/20">
                                    <Link href="/seller">
                                        <Image
                                            src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20size.png?updatedAt=1738307076179"
                                            alt="Logo"
                                            width={40} 
                                            height={40}
                                            className="object-contain"
                                        />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-x-4 p-2 rounded-lg 
                                transition-all duration-300 
                                hover:scale-[1.02]
                                group
                                relative
                                ${pathname === item.path 
                                    ? "bg-gradient-to-r from-[#FF8008] to-[#FFA557] text-white shadow-[0_0_20px_-5px_#FF8008]"
                                    : "text-white/80 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_-5px_#FF8008]"
                                }`}>
                                <div className="transition-transform duration-300 group-hover:scale-110">
                                    <span className="text-xl">{item.icon}</span>
                                </div>
                                <span className={`origin-left duration-200 ${!isOpen && "hidden"}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout Section */}
                    <div className={`pt-8 mt-8 border-t border-[#FF8008]/20 ${!isOpen && "text-center"}`}>
                        <Link
                            href="/login"
                            className="flex items-center gap-x-4 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 group">
                            <div className="transition-transform duration-300 group-hover:scale-110">
                                <span className="text-xl">👋</span>
                            </div>
                            <span className={`${!isOpen && "hidden"}`}>Logout</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
};

export default LayoutSeller;
