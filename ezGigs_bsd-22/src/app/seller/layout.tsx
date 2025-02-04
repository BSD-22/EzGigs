"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LayoutSeller = ({ children }: { children: React.ReactNode }) => {
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
    {
      icon: "📊",
      name: "Sales Analytics",
      path: "/seller/sales",
    },
    {
      icon: "⚙️",
      name: "Settings",
      path: "/seller/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <div className="relative w-64 bg-[#0D0D0D] backdrop-blur-xl border-r border-[#FF8008]/20 p-5 pt-20 duration-300 z-[40] overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF8008] via-[#FFA557] to-transparent opacity-30 z-0"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#FF8008] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#FFA557] opacity-40 rounded-full blur-[128px] animate-pulse z-0"></div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🎭</span>
            <h1 className="text-xl font-bold text-white">Ticket App</h1>
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
                ${
                  pathname === item.path
                    ? "bg-gradient-to-r from-[#FF8008] to-[#FFA557] text-white shadow-[0_0_20px_-5px_#FF8008]"
                    : "text-white/80 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_-5px_#FF8008]"
                }`}>
                <div className="transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span className="origin-left duration-200">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="pt-8 mt-8 border-t border-[#FF8008]/20">
            <Link
              href="/login"
              className="flex items-center gap-x-4 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <span className="text-xl">👋</span>
              </div>
              <span>Logout</span>
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
