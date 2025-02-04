"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { baseUrl } from "@/constants/baseUrl";

interface Activity {
  ticketId: string;
  price: number;
  date: Date;
  eventName: string;
}

const SellerPage = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    ticketsSold: 0,
    revenue: 0,
    averagePrice: 0,
    revenueGrowth: 0,
    successRate: 0,
    recentActivities: [] as Activity[],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/api/dashboard`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#2D1810]">Seller Dashboard 🎯</h1>
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-[#FF8008]/10 rounded animate-pulse mb-2 w-20"></div>
              <div className="h-8 bg-[#FF8008]/10 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-[#FF8008]/10 rounded animate-pulse w-24"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FF8008]/10 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#FF8008]/10 rounded animate-pulse mb-2 w-24"></div>
                  <div className="h-3 bg-[#FF8008]/10 rounded animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <div className="h-6 bg-[#FF8008]/10 rounded animate-pulse mb-6 w-32"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-b border-[#FF8008]/10 last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#FF8008]/10 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 bg-[#FF8008]/10 rounded animate-pulse mb-2 w-24"></div>
                  <div className="h-3 bg-[#FF8008]/10 rounded animate-pulse w-32"></div>
                </div>
              </div>
              <div className="h-3 bg-[#FF8008]/10 rounded animate-pulse w-16"></div>
            </div>
          ))}
        </div>

        <div className="text-center text-[#2D1810]/40 mt-4">AI is analyzing your dashboard data...</div>
      </div>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }
  };

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3]">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#2D1810]">Seller Dashboard 🎯</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <p className="text-[#2D1810]/90 text-sm font-medium">Total Tickets</p>
          <p className="text-3xl font-bold mt-2 text-[#2D1810]">{stats.totalTickets}</p>
          <div className="mt-2 text-xs text-[#FF8008] font-medium">All time</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <p className="text-[#2D1810]/90 text-sm font-medium">Tickets Sold</p>
          <p className="text-3xl font-bold mt-2 text-[#2D1810]">{stats.ticketsSold}</p>
          <div className="mt-2 text-xs text-[#FF8008] font-medium">{stats.successRate}% success rate</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <p className="text-[#2D1810]/90 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold mt-2 text-[#2D1810]">Rp {stats.revenue.toLocaleString("id-ID")}</p>
          <div className="mt-2 text-xs text-[#FF8008] font-medium">
            {stats.revenueGrowth > 0 ? "+" : ""}
            {stats.revenueGrowth}% from last month
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <p className="text-[#2D1810]/90 text-sm font-medium">Average Price</p>
          <p className="text-3xl font-bold mt-2 text-[#2D1810]">Rp {stats.averagePrice.toLocaleString("id-ID")}</p>
          <div className="mt-2 text-xs text-[#FF8008] font-medium">Per ticket</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/seller/manage-tickets"
          className="group">
          <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 hover:border-[#FF8008]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎫</span>
              <div>
                <h3 className="font-semibold text-[#2D1810] group-hover:text-[#FF8008] transition-colors">Manage Tickets</h3>
                <p className="text-sm text-[#2D1810]/60">View and edit your tickets</p>
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/seller/analytics"
          className="group">
          <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 hover:border-[#FF8008]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold text-[#2D1810] group-hover:text-[#FF8008] transition-colors">Sales Analytics</h3>
                <p className="text-sm text-[#2D1810]/60">Track your performance</p>
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/seller/settings"
          className="group">
          <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 hover:border-[#FF8008]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-[#2D1810] group-hover:text-[#FF8008] transition-colors">Settings</h3>
                <p className="text-sm text-[#2D1810]/60">Configure your account</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-[#2D1810]">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-[#FF8008]/10 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF8008]/10 flex items-center justify-center">💰</div>
                  <div>
                    <p className="font-medium text-[#2D1810]">Ticket Sold</p>
                    <p className="text-sm text-[#2D1810]/70">
                      {activity.eventName} - Rp {activity.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-[#2D1810]/60">{formatTimeAgo(activity.date)}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-[#2D1810]/60 py-4">No recent activities</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPage;
