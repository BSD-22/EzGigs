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
      <div className="w-64 border-r border-[#8E2DE2]/20 p-6 space-y-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Ticket App</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path ? "bg-gradient-to-r from-[#8E2DE2]/10 to-[#00F5A0]/10 text-white border border-[#8E2DE2]/20" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="pt-8 mt-8 border-t border-[#8E2DE2]/20">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <span className="text-xl">👋</span>
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default LayoutSeller;
