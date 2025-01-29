"use client";

import { useEffect, useState } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Add imports at the top
import { Dialog } from "@headlessui/react";
import { TicketPurchase } from "@/db/models/ticket";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; category: string } | null>(null);
  const [buyerData, setBuyerData] = useState({
    email: "",
    name: "",
    phone: "",
    identityType: "KTP" as TicketPurchase["identityType"],
    identityNumber: "",
  });

  const handleTicketClick = (ticketId: string) => {
    router.push(`/home/ticket/${ticketId}`);
  };

  // Add the missing handleBuyTicket function
  const handleBuyTicket = (ticketId: string, categoryName: string) => {
    setSelectedTicket({ id: ticketId, category: categoryName });
    setIsModalOpen(true);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/ticket", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setTickets(json?.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Update handleSubmitPurchase
  const handleSubmitPurchase = async () => {
    if (!selectedTicket) return;

    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          categoryName: selectedTicket.category,
          ...buyerData,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const stripeData = json.data;
        setIsModalOpen(false);
        router.push(stripeData.data.url); // Fix: access url through stripeData.data.url
      } else {
        console.error("Payment creation failed:", json.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  useEffect(() => {
    fetchTickets();

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success");
    const sessionId = urlParams.get("session_id");
    const purchaseId = urlParams.get("purchase_id");

    if (isSuccess && sessionId && purchaseId) {
      verifyPayment(sessionId, purchaseId);
    }
  }, []);

  const verifyPayment = async (sessionId: string, purchaseId: string) => {
    try {
      const res = await fetch(`/api/ticket/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, purchaseId }),
      });

      if (!res.ok) {
        console.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Main Content */}
      <div className="flex-1 p-7 overflow-auto">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-6">Welcome to TIXID! 🎉</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets?.map((ticket) => (
            <div
              key={ticket._id.toString()}
              onClick={() => handleTicketClick(ticket._id.toString())}
              className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-all duration-300 group cursor-pointer">
              <div className="relative h-48 w-full">
                <Image
                  src={ticket.image}
                  alt={ticket.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#00F5A0] transition-colors">{ticket.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{ticket.description}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#00F5A0] font-bold">From Rp {Math.min(...ticket.seatCategories.map((cat) => cat.price)).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      • {ticket.time}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-400">Available Categories:</p>
                    {ticket.seatCategories.map((category) => (
                      <button
                        key={category.name}
                        disabled={category.availableSeats <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyTicket(ticket._id.toString(), category.name);
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-left flex justify-between items-center ${
                          category.availableSeats > 0 ? "bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] text-white transition-colors" : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        }`}>
                        <span>{category.name}</span>
                        <div className="text-right">
                          <p>Rp {category.price.toLocaleString("id-ID")}</p>
                          <p className="text-xs opacity-75">{category.availableSeats} seats left</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="bg-[#8E2DE2]/20 px-2 py-1 rounded">{ticket.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">Enter Your Details</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={buyerData.name}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={buyerData.email}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={buyerData.phone}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Identity Type</label>
                <select
                  value={buyerData.identityType}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as TicketPurchase["identityType"] }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white">
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
                  value={buyerData.identityNumber}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, identityNumber: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Your identity number"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-[#8E2DE2]/20 rounded-lg hover:bg-[#8E2DE2]/20 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPurchase}
                  disabled={!buyerData.email || !buyerData.name || !buyerData.phone || !buyerData.identityNumber}
                  className="flex-1 px-4 py-2 bg-[#8E2DE2] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  Proceed to Payment
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
