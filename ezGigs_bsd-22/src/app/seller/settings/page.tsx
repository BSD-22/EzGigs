"use client";

import { useState } from "react";
import { baseUrl } from "@/constants/baseUrl";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sales: true,
      priceAlerts: true,
      marketUpdates: false,
    },
    display: {
      currency: "IDR",
      theme: "dark",
      language: "en",
    },
    pricing: {
      autoAdjust: false,
      minPriceMargin: 10,
      maxPriceMargin: 50,
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/seller/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3]">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#2D1810]">Settings ⚙️</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D1810]">Email Notifications</p>
                <p className="text-sm text-[#2D1810]/60">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8008]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D1810]">Sales Alerts</p>
                <p className="text-sm text-[#2D1810]/60">Get notified when you make a sale</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sales}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sales: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8008]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D1810]">Price Alerts</p>
                <p className="text-sm text-[#2D1810]/60">Get AI-powered price recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.priceAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, priceAlerts: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8008]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">Display</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#2D1810]/70 mb-2">Currency</label>
              <select
                value={settings.display.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, currency: e.target.value },
                  })
                }
                className="w-full bg-white/50 border border-[#FF8008]/20 rounded-lg px-4 py-2 text-[#2D1810]">
                <option value="IDR">IDR (Indonesian Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#2D1810]/70 mb-2">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, language: e.target.value },
                  })
                }
                className="w-full bg-white/50 border border-[#FF8008]/20 rounded-lg px-4 py-2 text-[#2D1810]">
                <option value="en">English</option>
                <option value="id">Indonesian</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Pricing Settings */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#2D1810] mb-4">AI Pricing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D1810]">Auto-adjust Prices</p>
                <p className="text-sm text-[#2D1810]/60">Let AI optimize your ticket prices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pricing.autoAdjust}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, autoAdjust: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8008]"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm text-[#2D1810]/70 mb-2">Minimum Price Margin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.pricing.minPriceMargin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: { ...settings.pricing, minPriceMargin: Number(e.target.value) },
                  })
                }
                className="w-full bg-white/50 border border-[#FF8008]/20 rounded-lg px-4 py-2 text-[#2D1810]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#2D1810]/70 mb-2">Maximum Price Margin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.pricing.maxPriceMargin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: { ...settings.pricing, maxPriceMargin: Number(e.target.value) },
                  })
                }
                className="w-full bg-white/50 border border-[#FF8008]/20 rounded-lg px-4 py-2 text-[#2D1810]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-gradient-to-r from-[#FF8008] to-[#FFA03C] rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
            Save Settings
          </button>
          {saved && <span className="text-[#FF8008] animate-fade-out">Settings saved successfully!</span>}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
