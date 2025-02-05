"use client";

import { useEffect, useState, useRef } from "react";
import { TicketModel } from "@/db/models/ticket";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import GridView from "./_components/GridView";
import ListView from "./_components/ListView";
import { ToastContainer } from "react-toastify";
import { TicketsSkeleton } from "@/components/skeletons/TicketsSkeleton";
import { startNotificationService } from "./_utils/ticketNotifications";
import Header from "@/components/Header";
import TicketPurchaseModal from "@/components/TicketPurchaseModal";
import { TicketPurchase } from "@/db/models/ticket";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; category: string } | null>(null);
  const [isLoading, setisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const utcOffset = 7;
    const utc = today.getTime() + today.getTimezoneOffset() * 60000;
    const wibDate = new Date(utc + 3600000 * utcOffset);
    wibDate.setHours(0, 0, 0, 0);
    const localOffset = new Date().getTimezoneOffset();
    const adjustedDate = new Date(wibDate.getTime() - localOffset * 60000);

    return adjustedDate;
  });

  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [userSubscription, setUserSubscription] = useState<"free" | "premium" | "vip">("free");
  const isSubmittingRef = useRef(false);
  const hasVerifiedPaymentRef = useRef(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const handleTicketClick = (ticketId: string) => {
    router.push(`/home/ticket/${ticketId}`);
  };

  const handleBuyTicket = (ticketId: string, categoryName: string) => {
    setSelectedTicket({ id: ticketId, category: categoryName });
    setIsModalOpen(true);
  };

  const fetchTickets = async () => {
    try {
      setisLoading(true);
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
    } finally {
      setisLoading(false);
    }
  };

  const handleSubmitPurchase = async (buyerData: Omit<TicketPurchase, "_id" | "ticketId" | "categoryName" | "seatNumber" | "price" | "paymentStatus" | "paymentIntentId" | "purchaseDate">) => {
    if (isSubmittingRef.current) {
      toast.info("Processing is already in progress. Please wait.");
      return;
    }

    if (!selectedTicket) {
      toast.error("No ticket selected");
      return;
    }

    isSubmittingRef.current = true;

    try {
      localStorage.setItem("tempBuyerData", JSON.stringify(buyerData));

      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          categoryName: selectedTicket.category,
          subscriptionType: userSubscription,
          ...buyerData,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const stripeData = json.data;
        setIsModalOpen(false);
        router.push(stripeData.url);
      } else {
        toast.error(json.message || "Payment creation failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data) {
        setUserSubscription(data.data.subscriptionType);
      } else {
        toast.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    }
  };

  const calculateDiscountedPrice = (price: number) => {
    if (userSubscription === "premium") return price * 0.95;
    if (userSubscription === "vip") return price * 0.92;
    return price;
  };

  const verifyPayment = async (sessionId: string, purchaseId: string) => {
    try {
      const verifyRes = await fetch("/api/ticket/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, purchaseId }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.message || "Payment verification failed");
        return;
      }

      if (verifyData.statusCode === 200) {
        toast.success("Payment successful! Your ticket has been confirmed.");
        localStorage.removeItem("tempBuyerData");
        await fetchTickets();
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Error verifying payment");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredAndSortedTickets = tickets
    .filter((ticket) => {
      const matchesSearch = ticket.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || ticket.venue.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      if (!startDate && !endDate) return matchesSearch;

      const eventDate = new Date(ticket.date);
      const isAfterStart = !startDate || eventDate >= startDate;
      const isBeforeEnd = !endDate || eventDate <= endDate;

      return matchesSearch && isAfterStart && isBeforeEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  useEffect(() => {
    fetchTickets();
    fetchUserData();

    let cleanup: (() => void) | undefined;

    const initNotifications = async () => {
      cleanup = await startNotificationService();
    };

    initNotifications();

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success");
    const sessionId = urlParams.get("session_id");
    const purchaseId = urlParams.get("purchase_id");

    if (isSuccess && sessionId && purchaseId && !hasVerifiedPaymentRef.current) {
      verifyPayment(sessionId, purchaseId);
      hasVerifiedPaymentRef.current = true;
    }

    return () => {
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
      {isLoading ? (
        <TicketsSkeleton viewMode={viewMode} />
      ) : (
        <div className="flex-1 p-3 sm:p-7 overflow-auto">
          <div className="flex flex-col gap-3 sm:gap-6 mb-4 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <Header
                title="Upcoming Events"
                description="Discover and book your next unforgettable experience 🎉"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded-lg ${viewMode === "grid" ? "bg-[#4A5043] text-white" : "bg-gray-100"}`}>
                  📱
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:p-2 rounded-lg ${viewMode === "list" ? "bg-[#4A5043] text-white" : "bg-gray-100"}`}>
                  📝
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg sm:rounded-xl bg-white border border-[#D3D9C9]"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <input
                  type="date"
                  value={startDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-white border border-[#D3D9C9] min-w-[100px] sm:min-w-[120px]"
                />
                <input
                  type="date"
                  value={endDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-white border border-[#D3D9C9] min-w-[100px] sm:min-w-[120px]"
                />
                <button
                  onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-[#D3D9C9] flex items-center gap-1 sm:gap-2 hover:bg-[#F4F6F0]">
                  <span className="text-xs sm:text-sm">Date</span>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <GridView
              tickets={filteredAndSortedTickets}
              handleTicketClick={handleTicketClick}
              handleBuyTicket={handleBuyTicket}
              calculateDiscountedPrice={calculateDiscountedPrice}
            />
          ) : (
            <ListView
              tickets={filteredAndSortedTickets}
              handleTicketClick={handleTicketClick}
              handleBuyTicket={handleBuyTicket}
              calculateDiscountedPrice={calculateDiscountedPrice}
              userSubscription={userSubscription} // Add this line
            />
          )}
        </div>
      )}
      <ToastContainer />

      <TicketPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPurchase}
        requiresVerification={true}
      />
    </div>
  );
}
