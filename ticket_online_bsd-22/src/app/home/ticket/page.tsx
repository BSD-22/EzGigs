"use client";

import { useEffect, useState } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { baseUrl } from "@/constants/baseUrl";
import { useRouter } from "next/navigation";
import { StripeResponse } from "@/services/stripe";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);

  const fetchTickets = async () => {
    const res = await fetch(baseUrl + "/api/ticket", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();

    setTickets(json?.data);
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/home/ticket/${ticketId}`);
  };

  const handleBuyTicket = async (ticketId: string) => {
    try {
      const res = await fetch(baseUrl + "/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ticketId }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const stripeData = json.data as StripeResponse;

        router.push(stripeData.url);
      } else {
        console.error("Payment creation failed:", json.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[#00F5A0] font-bold">Rp {ticket.price.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      • {ticket.time}
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-[#8E2DE2] rounded-lg hover:bg-[#7B27C1] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking button
                      // Add buy now logic here
                      handleBuyTicket(ticket._id.toString());
                    }}>
                    Buy Now
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-[#8E2DE2]/20 px-2 py-1 rounded">{ticket.venue}</span>
                  <span className="bg-[#8E2DE2]/20 px-2 py-1 rounded">Seat {ticket.seats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
