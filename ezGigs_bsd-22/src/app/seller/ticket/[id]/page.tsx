"use client";

import { baseUrl } from "@/constants/baseUrl";
import { TicketModel } from "@/db/models/ticket";
import { use, useEffect, useState } from "react";
import Image from "next/image";

const TicketDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicketById = async () => {
    try {
      setLoading(true);
      const res = await fetch(baseUrl + `/api/ticket/${id}`);
      const data = await res.json();

      if (data.statusCode === 200) {
        setTicket(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#8E2DE2] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400">Ticket Not Found</h2>
          <p className="text-gray-500 mt-2">The ticket you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden">
          <div className="relative h-96 w-full">
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-6">{ticket.name}</h1>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Venue</h3>
                  <p className="text-lg text-white">{ticket.venue}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Date & Time</h3>
                  <p className="text-lg text-white">
                    {new Date(ticket.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    {ticket.time}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-gray-400 mb-3">Description</h3>
                <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-400 mb-3">Ticket Categories</h3>
                <div className="space-y-4">
                  {ticket.seatCategories.map((category) => (
                    <div
                      key={category.name}
                      className="bg-black/40 border border-[#8E2DE2]/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{category.name}</h4>
                          <p className="text-[#00F5A0]">Rp {category.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Available Seats</p>
                          <p className="text-white">
                            {category.availableSeats}/{category.totalSeats}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
