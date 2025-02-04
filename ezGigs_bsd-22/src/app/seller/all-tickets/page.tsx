"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TicketModel } from "@/db/models/ticket";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/services/firebase";

interface TicketWithUser extends TicketModel {
  userId: string;
}

const SellerAllTicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showOwnTickets, setShowOwnTickets] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const requestNotification = async () => {
      if (!("Notification" in window)) return;
      await Notification.requestPermission();
    };

    const fetchUserAndTickets = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(baseUrl + "/api/user/me");
        const userData = await userRes.json();
        if (userData.statusCode === 200) {
          setCurrentUserId(userData.data._id);
        }

        const ticketRes = await fetch(baseUrl + "/api/ticket");
        const ticketData = await ticketRes.json();
        if (ticketData.statusCode === 200) {
          const mappedTickets = ticketData.data.map((ticket: TicketModel) => ({
            ...ticket,
            userId: ticket.sellerId?.toString(),
          }));
          setTickets(mappedTickets);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    requestNotification();
    fetchUserAndTickets(); // Call it immediately

    const newTicketsRef = ref(database, "newTickets");
    onValue(newTicketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.latest) {
        if (Notification.permission === "granted") {
          new Notification("New Event Added! 🎫", {
            body: `${data.latest.eventName}\nDate: ${data.latest.eventDate}\nTime: ${data.latest.eventTime}\nVenue: ${data.latest.venue}`,
            icon: data.latest.image,
          });
        }
        fetchUserAndTickets();
      }
    });

    return () => {
      off(newTicketsRef);
    };
  }, []);

  // Move filteredTickets outside useEffect and simplify the filter logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || ticket.date === dateFilter;
    return matchesSearch && matchesDate && (showOwnTickets ? ticket.sellerId?.toString() === currentUserId : true);
  });

  if (loading) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-[#2D1810]">All Tickets 🎫</h1>
          <div className="w-32 h-10 bg-[#FF8008]/10 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-10 bg-[#FF8008]/10 rounded-lg animate-pulse"></div>
          <div className="w-48 h-10 bg-[#FF8008]/10 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl overflow-hidden shadow-sm">
              <div className="h-48 bg-[#FF8008]/10 animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 bg-[#FF8008]/10 rounded animate-pulse mb-4 w-3/4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-[#FF8008]/10 rounded animate-pulse w-2/3"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Modify the return statement, add the toggle button before the search inputs
  return (
    <div className="flex-1 p-4 md:p-7 bg-[#FFF8F3] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#2D1810]">All Tickets 🎫</h1>
        <button
          onClick={() => setShowOwnTickets(!showOwnTickets)}
          className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium transition-colors ${
            showOwnTickets 
              ? "bg-[#FF8008] text-white" 
              : "bg-[#FF8008]/10 text-[#FF8008] hover:bg-[#FF8008]/20"
          }`}
        >
          {showOwnTickets ? "Show All Tickets" : "Show My Tickets"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white/80 border border-[#FF8008]/10 rounded-lg focus:outline-none focus:border-[#FF8008] text-[#2D1810] placeholder-[#2D1810]/40"
          />
        </div>
        <div className="w-full md:w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white/80 border border-[#FF8008]/10 rounded-lg focus:outline-none focus:border-[#FF8008] text-[#2D1810]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket._id.toString()}
            className="bg-white/80 backdrop-blur-xl border border-[#FF8008]/10 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#FF8008]/30 transition-all">
            <div className="relative h-40 sm:h-48 w-full">
              <Image
                src={ticket.image}
                alt={ticket.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-2 text-[#2D1810] line-clamp-2">{ticket.name}</h3>
              <div className="space-y-2 text-[#2D1810]/70 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="line-clamp-1">{ticket.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{new Date(ticket.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>{ticket.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💺</span>
                  <span className="line-clamp-1">{ticket.seatCategories.map((cat) => `${cat.name} (${cat.availableSeats}/${cat.totalSeats})`).join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>From Rp {Math.min(...ticket.seatCategories.map((cat) => cat.price)).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {ticket.userId === currentUserId ? (
                  <>
                    <button
                      onClick={() => router.push(`/seller/edit-ticket/${ticket._id}`)}
                      className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-[#FF8008]/10 text-[#2D1810] rounded-lg hover:bg-[#FF8008]/20 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/seller/ticket/${ticket._id}`)}
                      className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-[#FF8008] text-white rounded-lg hover:bg-[#FF8008]/90 transition-colors shadow-lg shadow-[#FF8008]/20">
                      View Details
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/seller/ticket/${ticket._id}`)}
                    className="w-full px-3 md:px-4 py-2 text-sm md:text-base bg-[#FF8008] text-white rounded-lg hover:bg-[#FF8008]/90 transition-colors shadow-lg shadow-[#FF8008]/20">
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-[#FF8008]/10 flex items-center justify-center">
            <span className="text-3xl md:text-4xl">🎫</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2D1810]">No Tickets Found</h2>
          <p className="text-[#2D1810]/60 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default SellerAllTicketsPage;
