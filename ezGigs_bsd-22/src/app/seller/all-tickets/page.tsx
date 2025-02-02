"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TicketModel } from "@/db/models/ticket";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/services/firebase";

// Add interface for user data from API
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

        const ticketRes = await fetch(baseUrl + "/api/ticket"); // Changed to fetch all tickets
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
      <div className="flex-1 p-7 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#8E2DE2] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Modify the return statement, add the toggle button before the search inputs
  return (
    <div className="flex-1 p-7">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">All Tickets 🎫</h1>
        <button
          onClick={() => setShowOwnTickets(!showOwnTickets)}
          className={`px-4 py-2 rounded-lg transition-colors ${showOwnTickets ? "bg-[#8E2DE2] text-white" : "bg-[#8E2DE2]/10 text-[#8E2DE2]"}`}>
          {showOwnTickets ? "Show All Tickets" : "Show My Tickets"}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
          />
        </div>
        <div className="w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket._id.toString()}
            className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={ticket.image}
                alt={ticket.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-white">{ticket.name}</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{ticket.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    {new Date(ticket.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>{ticket.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💺</span>
                  <span>{ticket.seatCategories.map((cat) => `${cat.name} (${cat.availableSeats}/${cat.totalSeats})`).join(", ")}</span>
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
                      className="flex-1 px-4 py-2 bg-[#8E2DE2]/10 text-[#8E2DE2] rounded-lg hover:bg-[#8E2DE2]/20 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/seller/ticket/${ticket._id}`)}
                      className="flex-1 px-4 py-2 bg-[#00F5A0]/10 text-[#00F5A0] rounded-lg hover:bg-[#00F5A0]/20 transition-colors">
                      View Details
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/seller/ticket/${ticket._id}`)}
                    className="w-full px-4 py-2 bg-[#00F5A0]/10 text-[#00F5A0] rounded-lg hover:bg-[#00F5A0]/20 transition-colors">
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#8E2DE2]/10 flex items-center justify-center">
            <span className="text-4xl">🎫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-400">No Tickets Found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default SellerAllTicketsPage;
