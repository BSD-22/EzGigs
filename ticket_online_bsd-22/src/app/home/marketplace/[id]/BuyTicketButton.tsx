"use client";

import { baseUrl } from "@/constants/baseUrl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function BuyTicketButton({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [buyerData, setBuyerData] = useState({
    buyerEmail: "",
    buyerName: "",
    buyerPhone: "",
    identityType: "KTP" as "KTP" | "Passport" | "SIM" | "Student",
    identityNumber: "",
  });

  const handleBuyTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/marketplace/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(buyerData),
      });

      if (response.ok) {
        router.push("/home/my-tickets");
      }
    } catch (error) {
      console.error("Error buying ticket:", error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  if (isOwner) {
    return (
      <button
        disabled
        className="px-8 py-3 bg-gray-500/20 text-gray-400 rounded-xl cursor-not-allowed">
        Your Listing
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
        {loading ? "Processing..." : "Buy Ticket"}
      </button>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-black/90 rounded-2xl p-8 max-w-md w-full border border-[#8E2DE2]/20">
            <Dialog.Title className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Enter Buyer Details</Dialog.Title>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBuyTicket();
              }}
              className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={buyerData.buyerEmail}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerEmail: e.target.value }))}
                  className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={buyerData.buyerName}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerName: e.target.value }))}
                  className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={buyerData.buyerPhone}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                  className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Identity Type</label>
                <select
                  value={buyerData.identityType}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as typeof buyerData.identityType }))}
                  className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white">
                  <option value="KTP">KTP</option>
                  <option value="Passport">Passport</option>
                  <option value="SIM">SIM</option>
                  <option value="Student">Student ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Identity Number</label>
                <input
                  type="text"
                  required
                  value={buyerData.identityNumber}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, identityNumber: e.target.value }))}
                  className="w-full bg-black/50 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-[#8E2DE2]/20 rounded-lg text-gray-400 hover:border-[#8E2DE2] transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
