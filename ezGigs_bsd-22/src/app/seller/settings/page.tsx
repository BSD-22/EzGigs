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
    <div className="flex-1 p-7">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Settings ⚙️</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive updates via email</p>
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
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F5A0]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sales Alerts</p>
                <p className="text-sm text-gray-400">Get notified when you make a sale</p>
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
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F5A0]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Alerts</p>
                <p className="text-sm text-gray-400">Get AI-powered price recommendations</p>
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
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F5A0]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Display</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Currency</label>
              <select
                value={settings.display.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, currency: e.target.value },
                  })
                }
                className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white">
                <option value="IDR">IDR (Indonesian Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, language: e.target.value },
                  })
                }
                className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white">
                <option value="en">English</option>
                <option value="id">Indonesian</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Pricing Settings */}
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">AI Pricing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-adjust Prices</p>
                <p className="text-sm text-gray-400">Let AI optimize your ticket prices</p>
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
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F5A0]"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Minimum Price Margin (%)</label>
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
                className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Maximum Price Margin (%)</label>
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
                className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
            Save Settings
          </button>
          {saved && <span className="text-[#00F5A0] animate-fade-out">Settings saved successfully!</span>}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
