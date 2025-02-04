"use client";

import { useEffect, useState } from "react";
import { baseUrl } from "@/constants/baseUrl";

type TicketAnalysis = {
  ticketId: string;
  name: string;
  status: string;
  price: number;
  demand: "High" | "Medium" | "Low";
  recommendedPrice: number;
  insights: string;
};

const ManageTicketsPage = () => {
  const [tickets, setTickets] = useState<TicketAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/seller/tickets`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setTickets(data.data);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#2D1810]">Manage Tickets 🎫</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8008]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2D1810]">{ticket.name}</h3>
                    <p className="text-sm text-[#2D1810]/70">ID: {ticket.ticketId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      ticket.status === "active" 
                        ? "bg-[#FF8008]/10 text-[#FF8008]" 
                        : ticket.status === "sold" 
                        ? "bg-[#FF8008]/10 text-[#FF8008]" 
                        : "bg-[#FF8008]/10 text-[#FF8008]"
                    }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#2D1810]/70">Current Price</p>
                    <p className="text-lg font-bold text-[#2D1810]">Rp {ticket.price.toLocaleString("id-ID")}</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#2D1810]/70">Market Demand</p>
                    <p className={`text-lg font-bold ${
                      ticket.demand === "High" 
                        ? "text-[#FF8008]" 
                        : ticket.demand === "Medium" 
                        ? "text-[#FF8008]/80" 
                        : "text-[#FF8008]/60"
                    }`}>
                      {ticket.demand}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#2D1810]/70">AI Recommended Price</p>
                    <p className="text-lg font-bold text-[#FF8008]">
                      Rp {ticket.recommendedPrice.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="bg-[#FF8008]/5 rounded-lg p-4">
                    <p className="text-sm text-[#2D1810]/70">AI Insights</p>
                    <p className="text-sm mt-1 text-[#2D1810]">{ticket.insights}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-[#FF8008]/10 hover:bg-[#FF8008] text-[#FF8008] hover:text-white rounded-lg transition-colors">
                    Edit Price
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#FF8008]/10 hover:bg-[#FF8008] text-[#FF8008] hover:text-white rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTicketsPage;
