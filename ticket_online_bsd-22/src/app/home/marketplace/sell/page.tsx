"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CustomResponse } from "@/types";
import { baseUrl } from "@/constants/baseUrl";
import { UserModel } from "@/db/models/user";
import { TicketModel } from "@/db/models/ticket";

type UserTicketWithDetails = NonNullable<UserModel["ownedTickets"]>[number] & {
  ticketDetails: TicketModel;
};

const MarketplaceSell = () => {
  const [ownedTickets, setOwnedTickets] = useState<UserTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(baseUrl + "/api/marketplace", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const json = (await res.json()) as CustomResponse<{
          ownedTickets: UserTicketWithDetails[];
        }>;

        if (json.statusCode === 200 && json.data) {
          const ownedOnly = json.data.ownedTickets?.filter((ticket) => ticket.status === "owned") || [];
          setOwnedTickets(ownedOnly);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSellTicket = async (ticketId: string) => {
    try {
      const response = await fetch(baseUrl + "/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId }),
      });

      if (response.ok) {
        setOwnedTickets((prev) => prev?.filter((ticket) => ticket.ticketId.toString() !== ticketId));
      }
    } catch (error) {
      console.error("Error selling ticket:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8E2DE2]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7 overflow-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Sell Your Tickets 🎫</h1>
        <p className="text-gray-400 mt-2">Select the tickets you want to sell in the marketplace</p>
      </div>

      {ownedTickets?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-400">No Tickets Available</h2>
          <p className="text-gray-500 mt-2">You don&apos;t have any tickets to sell at the moment.</p>
          <a
            href="/home/marketplace"
            className="inline-block mt-4 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedTickets?.map((ticket) => (
            <div
              key={ticket.ticketId.toString()}
              className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-all duration-300 group">
              <div className="relative h-48 w-full">
                <Image
                  src={ticket.ticketDetails.image}
                  alt={ticket.ticketDetails.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-[#00F5A0] font-bold">Rp {ticket.ticketDetails.price.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#00F5A0] transition-colors">{ticket.ticketDetails.name}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{ticket.ticketDetails.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      {new Date(ticket.ticketDetails.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💺</span>
                    <span>Seat {ticket.ticketDetails.seats}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSellTicket(ticket.ticketId.toString())}
                  className="mt-4 w-full bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  List for Sale
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceSell;
