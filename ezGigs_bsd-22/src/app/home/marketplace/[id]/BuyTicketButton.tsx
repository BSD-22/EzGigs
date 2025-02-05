"use client";

import { baseUrl } from "@/constants/baseUrl";
import { useState } from "react";
import TicketPurchaseModal from "@/components/TicketPurchaseModal";
import { TicketPurchase } from "@/db/models/ticket";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function BuyTicketButton({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleBuyTicket = async (buyerData: Omit<TicketPurchase, "_id" | "ticketId" | "categoryName" | "seatNumber" | "price" | "paymentStatus" | "paymentIntentId" | "purchaseDate">) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/marketplace/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          buyerEmail: buyerData.buyerEmail,
          buyerName: buyerData.buyerName,
          buyerPhone: buyerData.buyerPhone,
          identityType: buyerData.identityType,
          identityDetails: buyerData.identityDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate purchase");
      }

      const data = await response.json();

      if (data.data?.url) {
        router.push(data?.data.url);
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error buying ticket:", error);
      toast.error("Failed to purchase ticket. Please try again.");
      setIsModalOpen(false);
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
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-[#00D2FF] to-[#3A7BD5] rounded-xl text-white font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-wait">
        {loading ? "Processing..." : "Buy Ticket"}
      </button>

      <TicketPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBuyTicket}
        requiresVerification={true}
      />
    </>
  );
}
