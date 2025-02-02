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
    <div className="flex-1 p-7">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Manage Tickets 🎫</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8E2DE2]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{ticket.name}</h3>
                    <p className="text-sm text-gray-400">ID: {ticket.ticketId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      ticket.status === "active" ? "bg-green-500/20 text-green-400" : ticket.status === "sold" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-lg font-bold">Rp {ticket.price.toLocaleString("id-ID")}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Market Demand</p>
                    <p className={`text-lg font-bold ${ticket.demand === "High" ? "text-green-400" : ticket.demand === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{ticket.demand}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">AI Recommended Price</p>
                    <p className="text-lg font-bold text-[#00F5A0]">Rp {ticket.recommendedPrice.toLocaleString("id-ID")}</p>
                  </div>

                  <div className="bg-[#8E2DE2]/10 rounded-lg p-4">
                    <p className="text-sm text-gray-400">AI Insights</p>
                    <p className="text-sm mt-1">{ticket.insights}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] text-white rounded-lg transition-colors">Edit Price</button>
                  <button className="flex-1 px-4 py-2 bg-[#00F5A0]/20 hover:bg-[#00F5A0] text-white rounded-lg transition-colors">View Details</button>
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
