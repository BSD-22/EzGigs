"use client";

import Link from "next/link";

const SellerPage = () => {
  const stats = {
    totalTickets: 24,
    ticketsSold: 18,
    revenue: 12500000,
    activeListings: 6,
  };

  return (
    <div className="flex-1 p-7">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Seller Dashboard 🎯</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Tickets</p>
          <p className="text-3xl font-bold mt-2">{stats.totalTickets}</p>
          <div className="mt-2 text-xs text-[#00F5A0]">All time</div>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Tickets Sold</p>
          <p className="text-3xl font-bold mt-2">{stats.ticketsSold}</p>
          <div className="mt-2 text-xs text-[#00F5A0]">75% success rate</div>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">Rp {stats.revenue.toLocaleString("id-ID")}</p>
          <div className="mt-2 text-xs text-[#00F5A0]">+12% from last month</div>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Active Listings</p>
          <p className="text-3xl font-bold mt-2">{stats.activeListings}</p>
          <div className="mt-2 text-xs text-[#00F5A0]">In marketplace</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/seller/tickets"
          className="group">
          <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6 hover:border-[#8E2DE2]/40 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎫</span>
              <div>
                <h3 className="font-semibold group-hover:text-[#00F5A0] transition-colors">Manage Tickets</h3>
                <p className="text-sm text-gray-400">View and edit your tickets</p>
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/seller/sales"
          className="group">
          <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6 hover:border-[#8E2DE2]/40 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold group-hover:text-[#00F5A0] transition-colors">Sales Analytics</h3>
                <p className="text-sm text-gray-400">Track your performance</p>
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/seller/settings"
          className="group">
          <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6 hover:border-[#8E2DE2]/40 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚙️</span>
              <div>
                <h3 className="font-semibold group-hover:text-[#00F5A0] transition-colors">Settings</h3>
                <p className="text-sm text-gray-400">Configure your account</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#8E2DE2]/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 flex items-center justify-center">💰</div>
              <div>
                <p className="font-medium">Ticket Sold</p>
                <p className="text-sm text-gray-400">Concert Ticket #123 - Rp 750,000</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[#8E2DE2]/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#8E2DE2]/10 flex items-center justify-center">🎫</div>
              <div>
                <p className="font-medium">New Ticket Listed</p>
                <p className="text-sm text-gray-400">Festival Pass #456</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 flex items-center justify-center">📝</div>
              <div>
                <p className="font-medium">Price Updated</p>
                <p className="text-sm text-gray-400">Concert Ticket #789</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPage;
