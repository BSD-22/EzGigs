"use client";

import { baseUrl } from "@/constants/baseUrl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BuyTicketButton({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuyTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/marketplace/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        router.push("/home/my-tickets");
      }
    } catch (error) {
      console.error("Error buying ticket:", error);
    } finally {
      setLoading(false);
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
    <button
      onClick={handleBuyTicket}
      disabled={loading}
      className="px-8 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
      {loading ? "Processing..." : "Buy Ticket"}
    </button>
  );
}
