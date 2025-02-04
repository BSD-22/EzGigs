"use client";

import { baseUrl } from "@/constants/baseUrl";
import { TicketModel } from "@/db/models/ticket";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
      <div className="h-screen bg-[#FFF8F3] flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#FF8008] border-t-transparent animate-spin shadow-lg"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-screen bg-[#FFF8F3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D1810]">Ticket Not Found</h2>
          <p className="text-[#2D1810]/60 mt-2">The ticket you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FFF8F3] flex flex-col">
      {/* Main Content Grid */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative">
          {/* Back Button */}
          <Link 
            href="/seller/all-tickets"
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full transition-all text-white"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back</span>
          </Link>

          <Image
            src={ticket.image}
            alt={ticket.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 md:bg-gradient-to-r md:from-black/20 md:via-transparent md:to-[#FFF8F3]" />
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 p-6 md:p-12 overflow-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#2D1810] mb-4">{ticket.name}</h1>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-[#FF8008]/10 text-[#FF8008] rounded-full text-sm">
                {new Date(ticket.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="px-3 py-1 bg-[#FF8008]/10 text-[#FF8008] rounded-full text-sm">
                {ticket.time}
              </span>
            </div>
          </div>

          {/* Venue & Description */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <div>
              <h3 className="text-sm font-medium text-[#2D1810]/60 mb-2">Venue</h3>
              <p className="text-base md:text-lg text-[#2D1810] flex items-center gap-2">
                <span>📍</span> {ticket.venue}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#2D1810]/60 mb-2">Description</h3>
              <p className="text-[#2D1810] whitespace-pre-wrap leading-relaxed line-clamp-3">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Ticket Categories */}
          <div>
            <h3 className="text-sm font-medium text-[#2D1810]/60 mb-3">Ticket Categories</h3>
            <div className="grid grid-cols-1 gap-3">
              {ticket.seatCategories.map((category) => (
                <div
                  key={category.name}
                  className="bg-white/80 backdrop-blur-sm border border-[#FF8008]/10 rounded-xl p-3 hover:border-[#FF8008]/30 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-[#2D1810]">{category.name}</h4>
                      <p className="text-[#FF8008] font-semibold mt-1">
                        Rp {category.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#2D1810]/60">Available</p>
                      <p className="text-[#2D1810] font-medium">
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
  );
};

export default TicketDetail;
