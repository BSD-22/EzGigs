"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { baseUrl } from "@/constants/baseUrl";
import { UserModel } from "@/db/models/user";
import { TicketModel } from "@/db/models/ticket";
import { ObjectId } from "mongodb";
import { Dialog } from "@headlessui/react";
import Link from "next/link";

type UserTicketWithDetails = NonNullable<UserModel["ownedTickets"]>[number] & {
  ticketDetails: TicketModel;
};

const MarketplaceSell = () => {
  const [ownedTickets, setOwnedTickets] = useState<UserTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await fetch(baseUrl + "/api/marketplace", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const json = await res.json();

      if (res.ok && json.data) {
        const data = json.data;

        const ownedOnly = data.ownedTickets?.filter((ticket: { ticketId: ObjectId; status: string }) => ticket.status === "owned") || [];

        const ticketsWithDetails = ownedOnly.map((ticket: { ticketId: ObjectId; status: string }) => {
          const ticketDetail = data.ticketDetails?.find((detail: TicketModel) => detail._id.toString() === ticket.ticketId.toString());

          return {
            ...ticket,
            ticketDetails: ticketDetail,
          };
        });

        setOwnedTickets(ticketsWithDetails.filter((ticket: { ticketDetails: TicketModel; status: "owned"; ticketId: ObjectId }) => ticket.ticketDetails));
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellTicket = async (ticketId: string) => {
    setSelectedTicket(ticketId);
    setIsModalOpen(true);
  };

  const handleSubmitSale = async () => {
    if (!selectedTicket || !price) return;

    // Find the selected ticket details
    const ticket = ownedTickets.find((t) => t.ticketId.toString() === selectedTicket);
    if (!ticket) return;

    try {
      const response = await fetch(baseUrl + "/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ticketId: selectedTicket,
          price: Number(price),
          description,
          categoryName: ticket.categoryName, // Add categoryName
          seatNumber: ticket.seatNumber, // Add seatNumber
        }),
      });

      if (response.ok) {
        setOwnedTickets((prev) => prev.filter((ticket) => ticket.ticketId.toString() !== selectedTicket));
        setIsModalOpen(false);
        setSelectedTicket(null);
        setPrice("");
        setDescription("");
      }
    } catch (error) {
      console.error("Error selling ticket:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8E2DE2]"></div>
      </div>
    );
  }

  console.log(ownedTickets, "ownedTickets");

  return (
    <div className="flex-1 p-3 sm:p-7 overflow-auto">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-4xl font-black text-[#2C3228]">Sell Your Tickets 🎫</h1>
        <p className="text-[#4A5043] mt-0.5 sm:mt-2 text-[10px] sm:text-base">Select the tickets you want to sell in the marketplace</p>
      </div>

      {ownedTickets?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#2C3228]">No Tickets Available</h2>
          <p className="text-[#4A5043] mt-2">You don&apos;t have any tickets to sell at the moment.</p>
          <Link
            href="/home/marketplace"
            className="inline-block mt-4 px-6 py-3 bg-[#2C3228] text-white rounded-xl hover:bg-[#4A5043] transition-colors">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {ownedTickets?.map((ticket) => (
            <div
              key={ticket.ticketId.toString() + Math.floor(Math.random() * 1000)}
              className="bg-white rounded-lg sm:rounded-2xl overflow-hidden border border-[#D3D9C9] hover:shadow-lg transition-all h-full">
              <div className="relative">
                <div className="relative h-[120px] sm:h-[180px]">
                  <Image
                    src={ticket?.ticketDetails?.image}
                    alt={ticket?.ticketDetails?.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-4">
                  <div className="flex items-end justify-between gap-1 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] sm:text-xl font-bold text-white leading-tight line-clamp-2 mb-0.5 sm:mb-2">
                        {ticket?.ticketDetails?.name}
                      </h3>
                      <div className="flex items-start sm:items-center gap-0.5 sm:gap-2 text-[9px] sm:text-sm text-gray-200">
                        <span className="flex-shrink-0">📍</span>
                        <span className="line-clamp-1 break-words">{ticket?.ticketDetails?.venue}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 bg-white rounded-md sm:rounded-xl p-1 sm:p-2 text-center min-w-[35px] sm:min-w-[60px]">
                      <p className="text-sm sm:text-xl font-bold text-[#2C3228] leading-none">
                        {new Date(ticket?.ticketDetails?.date).getDate()}
                      </p>
                      <p className="text-[8px] sm:text-xs font-medium text-[#4A5043] mt-0.5">
                        {new Date(ticket?.ticketDetails?.date).toLocaleDateString("id-ID", { month: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 text-[9px] sm:text-sm text-[#4A5043]">
                  <span>💺</span>
                  <span>
                    {ticket.categoryName} - {ticket.seatNumber}
                  </span>
                </div>
                <div className="mb-2 sm:mb-3">
                  <p className="text-[#4A5043] text-[9px] sm:text-sm mb-0.5">Current Price</p>
                  <p className="text-[#2C3228] font-semibold text-sm sm:text-lg">
                    Rp {ticket?.ticketDetails?.seatCategories.find((cat) => cat.name === ticket.categoryName)?.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => handleSellTicket(ticket?.ticketId?.toString())}
                  className="w-full bg-[#2C3228] hover:bg-[#4A5043] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-[10px] sm:text-sm">
                  List for Sale
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#F4F6F0] rounded-2xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-2xl font-bold text-[#2C3228] mb-6 sticky top-0">List Ticket for Sale</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A5043] mb-2">Price (Rp)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A5043] mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all resize-none"
                  placeholder="Add a note about your ticket"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-red-600 border border-red-800/20 rounded-lg text-white hover:bg-red-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSale}
                  disabled={!price}
                  className="flex-1 px-4 py-2 bg-green-600 border border-green-800/20 rounded-lg text-white hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  List for Sale
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MarketplaceSell;
