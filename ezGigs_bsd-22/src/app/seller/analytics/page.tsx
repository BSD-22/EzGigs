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
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8E2DE2]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex-1 p-7">
        <p>Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Sales Analytics 📊</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
          <div className="h-64">
            {/* Add chart visualization here */}
            <div className="space-y-2">
              {analytics.revenueByMonth.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center gap-2">
                  <div className="w-24 text-sm text-gray-400">{month.month}</div>
                  <div className="flex-1 h-6 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0]"
                      style={{
                        width: `${(month.revenue / Math.max(...analytics.revenueByMonth.map((m) => m.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-32 text-right text-sm">Rp {month.revenue.toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Predictions */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">AI Predictions</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400">Expected Next Month Revenue</p>
              <p className="text-3xl font-bold mt-1">Rp {analytics.predictions.nextMonthRevenue.toLocaleString("id-ID")}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm ${analytics.predictions.growthTrend === "up" ? "text-green-400" : analytics.predictions.growthTrend === "down" ? "text-red-400" : "text-yellow-400"}`}>
                  {analytics.predictions.growthTrend === "up" ? "↑" : analytics.predictions.growthTrend === "down" ? "↓" : "→"}
                  {analytics.predictions.growthTrend}
                </span>
                <span className="text-sm text-gray-400">{analytics.predictions.confidence}% confidence</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">AI Insights</p>
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-[#8E2DE2]/10 rounded-lg p-4">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Events */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Events</h2>
          <div className="space-y-4">
            {analytics.topPerformingEvents.map((event) => (
              <div
                key={event.name}
                className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-gray-400">{event.soldCount} tickets sold</p>
                </div>
                <p className="text-[#00F5A0]">Rp {event.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
          <div className="space-y-4">
            {analytics.salesByCategory.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-gray-400">{category.count} tickets</p>
                </div>
                <p className="text-[#00F5A0]">Rp {category.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;
