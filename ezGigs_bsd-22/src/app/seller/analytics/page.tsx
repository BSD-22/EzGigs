"use client";

import { useEffect, useState } from "react";
import { baseUrl } from "@/constants/baseUrl";

type SalesAnalytics = {
  revenueByMonth: { month: string; revenue: number }[];
  topPerformingEvents: { name: string; revenue: number; soldCount: number }[];
  salesByCategory: { category: string; count: number; revenue: number }[];
  predictions: {
    nextMonthRevenue: number;
    growthTrend: "up" | "down" | "stable";
    confidence: number;
  };
  insights: string[];
};

const SalesAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/seller/analytics`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8008]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3] min-h-screen">
        <p className="text-[#2D1810]/70">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#2D1810]">Sales Analytics 📊</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">Revenue Trend</h2>
          <div className="h-64">
            <div className="space-y-2">
              {analytics.revenueByMonth.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center gap-2">
                  <div className="w-24 text-sm text-[#2D1810]/70">{month.month}</div>
                  <div className="flex-1 h-6 bg-[#FF8008]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF8008] to-[#FFA557]"
                      style={{
                        width: `${(month.revenue / Math.max(...analytics.revenueByMonth.map((m) => m.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-32 text-right text-sm text-[#2D1810]">
                    Rp {month.revenue.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Predictions */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">AI Predictions</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#2D1810]/70">Expected Next Month Revenue</p>
              <p className="text-3xl font-bold mt-1 text-[#2D1810]">
                Rp {analytics.predictions.nextMonthRevenue.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm ${
                  analytics.predictions.growthTrend === "up" 
                    ? "text-[#FF8008]" 
                    : analytics.predictions.growthTrend === "down" 
                    ? "text-[#FF8008]/60" 
                    : "text-[#FF8008]/80"
                }`}>
                  {analytics.predictions.growthTrend === "up" ? "↑" : analytics.predictions.growthTrend === "down" ? "↓" : "→"}
                  {analytics.predictions.growthTrend}
                </span>
                <span className="text-sm text-[#2D1810]/70">{analytics.predictions.confidence}% confidence</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[#2D1810]/70">AI Insights</p>
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-[#FF8008]/5 rounded-lg p-4">
                  <p className="text-sm text-[#2D1810]">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Events */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">Top Performing Events</h2>
          <div className="space-y-4">
            {analytics.topPerformingEvents.map((event) => (
              <div
                key={event.name}
                className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2D1810]">{event.name}</p>
                  <p className="text-sm text-[#2D1810]/70">{event.soldCount} tickets sold</p>
                </div>
                <p className="text-[#FF8008]">Rp {event.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">Sales by Category</h2>
          <div className="space-y-4">
            {analytics.salesByCategory.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2D1810]">{category.category}</p>
                  <p className="text-sm text-[#2D1810]/70">{category.count} tickets</p>
                </div>
                <p className="text-[#FF8008]">Rp {category.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;
