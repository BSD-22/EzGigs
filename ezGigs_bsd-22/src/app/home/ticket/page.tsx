"use client";

import { useEffect, useState } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { TicketPurchase } from "@/db/models/ticket";
import Webcam from "react-webcam";
import { useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; category: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [userSubscription, setUserSubscription] = useState<"free" | "premium" | "vip">("free");
  const webcamRef = useRef<Webcam | null>(null);
  const [buyerData, setBuyerData] = useState({
    email: "",
    name: "",
    phone: "",
    identityType: "KTP" as "KTP" | "Passport" | "SIM" | "Student",
    identityDetails: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleTicketClick = (ticketId: string) => {
    router.push(`/home/ticket/${ticketId}`);
  };

  const handleBuyTicket = (ticketId: string, categoryName: string) => {
    setSelectedTicket({ id: ticketId, category: categoryName });
    setIsModalOpen(true);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setBuyerData((prev) => ({ ...prev, identityDetails: imageSrc }));
        setShowCamera(false);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBuyerData((prev) => ({ ...prev, identityDetails: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchTickets = async () => {
    try {
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
    }
  };

  const handleSubmitPurchase = async () => {
    if (!selectedTicket) return;

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
        console.error("Payment creation failed:", json.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
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

        // Clear stored buyer data
        localStorage.removeItem("tempBuyerData");

        // Refresh tickets list
        await fetchTickets();
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Error verifying payment");
    } finally {
      // Redirect to tickets page without query params
      router.replace("/home/ticket");
    }
  };

  const filteredAndSortedTickets = tickets
    .filter((ticket) => {
      const matchesSearch = ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.venue.toLowerCase().includes(searchQuery.toLowerCase());

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

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success");
    const sessionId = urlParams.get("session_id");
    const purchaseId = urlParams.get("purchase_id");

    if (isSuccess && sessionId && purchaseId) {
      verifyPayment(sessionId, purchaseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
      <div className="flex-1 p-3 sm:p-7 overflow-auto">
        {/* Header Section - Even Smaller on Mobile */}
        <div className="flex flex-col gap-3 sm:gap-6 mb-4 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-5xl font-black text-[#2C3228]">Upcoming Events</h1>
              <p className="text-[#4A5043] mt-0.5 sm:mt-2 text-[10px] sm:text-base">Discover and book your next unforgettable experience 🎉</p>
            </div>
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

          {/* Compact Search & Filters for Mobile */}
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

        {/* Grid View - More Compact on Mobile */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {filteredAndSortedTickets.map((ticket) => (
              <div
                key={ticket._id.toString()}
                className="group h-full">
                <div
                  onClick={() => handleTicketClick(ticket._id.toString())}
                  className="bg-white rounded-lg sm:rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#D3D9C9] h-full">
                  {/* Compact Image Section */}
                  <div className="relative">
                    <div className="relative h-[100px] sm:h-[180px]">
                      <Image
                        src={ticket.image}
                        alt={ticket.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    {/* Updated Event Info for Mobile */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-4">
                      <div className="flex items-end justify-between gap-1 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[11px] sm:text-xl font-bold text-white leading-tight line-clamp-2 mb-0.5 sm:mb-2">{ticket.name}</h3>
                          <div className="flex items-start sm:items-center gap-0.5 sm:gap-2 text-[9px] sm:text-sm text-gray-200">
                            <span className="flex-shrink-0">📍</span>
                            <span className="line-clamp-2 sm:line-clamp-1 break-words">{ticket.venue}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 bg-white rounded-md sm:rounded-xl p-1 sm:p-2 text-center min-w-[35px] sm:min-w-[60px]">
                          <p className="text-sm sm:text-xl font-bold text-[#2C3228] leading-none">{new Date(ticket.date).getDate()}</p>
                          <p className="text-[8px] sm:text-xs font-medium text-[#4A5043] mt-0.5">{new Date(ticket.date).toLocaleDateString("id-ID", { month: "short" })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Status Bar */}
                  <div className="bg-[#F4F6F0] px-1.5 sm:px-4 py-1 sm:py-3 flex items-center justify-between text-[10px] sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="font-medium text-[#2C3228]">Live</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3">
                      <div className="flex items-center gap-1 bg-[#2C3228] text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full">
                        <span className="text-[8px] sm:text-xs">🎭</span>
                        <span className="text-[8px] sm:text-sm font-medium">{ticket.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Categories */}
                  <div className="p-1.5 sm:p-3 grid gap-1 sm:gap-2">
                    {ticket.seatCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyTicket(ticket._id.toString(), category.name);
                        }}
                        disabled={category.availableSeats <= 0}
                        className={`w-full p-1.5 sm:p-3 rounded-md sm:rounded-xl text-left transition-all ${
                          category.availableSeats > 0 ? "hover:bg-[#F4F6F0] border border-[#D3D9C9]" : "bg-gray-50 cursor-not-allowed opacity-60"
                        }`}>
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                              <span className="font-medium text-[#2C3228] text-[10px] sm:text-sm truncate">{category.name}</span>
                              {category.availableSeats <= 20 && (
                                <span className="px-1 py-0.5 text-[8px] sm:text-[10px] font-medium bg-red-100 text-red-600 rounded-full animate-pulse whitespace-nowrap">
                                  {category.availableSeats}
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1 sm:gap-2">
                              <div className="flex items-baseline gap-0.5 min-w-0">
                                <span className="text-[8px] sm:text-[10px] font-normal text-[#4A5043]">Rp</span>
                                <span className="text-[10px] sm:text-sm font-semibold text-[#2C3228] truncate">{Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`
                            h-[25px] w-[25px] sm:h-[40px] sm:w-[40px] rounded-md sm:rounded-lg flex flex-col items-center justify-center flex-shrink-0
                            ${category.availableSeats <= 20 ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#F4F6F0] text-[#2C3228] border border-[#D3D9C9]"}
                          `}>
                            <span className={`text-[10px] sm:text-sm font-semibold ${category.availableSeats <= 20 ? "text-red-600" : "text-[#2C3228]"}`}>{category.availableSeats}</span>
                            <span className={`text-[6px] sm:text-[8px] font-medium ${category.availableSeats <= 20 ? "text-red-500" : "text-[#4A5043]"}`}>seats</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTickets.map((ticket) => (
              <div
                key={ticket._id.toString()}
                onClick={() => handleTicketClick(ticket._id.toString())}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#D3D9C9] hover:shadow-lg transition-all cursor-pointer">
                <div className="flex flex-col sm:flex-row">
                  {/* Mobile-optimized Image Section */}
                  <div className="relative w-full sm:w-[280px] h-[180px] sm:h-auto flex-shrink-0">
                    <div className="relative h-full">
                      <Image
                        src={ticket.image}
                        alt={ticket.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white rounded-xl p-2 text-center min-w-[50px]">
                      <p className="text-lg font-semibold text-[#2C3228] leading-none">{new Date(ticket.date).getDate()}</p>
                      <p className="text-xs font-medium text-[#4A5043] mt-0.5">{new Date(ticket.date).toLocaleDateString("id-ID", { month: "short" })}</p>
                    </div>
                  </div>

                  {/* Mobile-optimized Content Section */}
                  <div className="flex-1 p-3 sm:p-4">
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 bg-[#2C3228] text-white px-2 py-1 rounded-full text-xs">
                          <span>🎭</span>
                          <span>{ticket.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-medium text-[#2C3228]">Live Sales</span>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-[#2C3228] mb-1 line-clamp-2">{ticket.name}</h3>
                      <p className="text-[#4A5043] flex items-center gap-1.5 text-sm">
                        <span>📍</span>
                        <span className="line-clamp-1">{ticket.venue}</span>
                      </p>
                    </div>

                    {/* Mobile-optimized Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ticket.seatCategories.map((category) => (
                        <button
                          key={category.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyTicket(ticket._id.toString(), category.name);
                          }}
                          disabled={category.availableSeats <= 0}
                          className={`p-3 rounded-xl text-left transition-all ${
                            category.availableSeats > 0 ? "hover:bg-[#F4F6F0] border border-[#D3D9C9]" : "bg-gray-50 cursor-not-allowed opacity-60"
                          }`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#2C3228] text-sm truncate">{category.name}</span>
                                {category.availableSeats <= 20 && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded-full animate-pulse whitespace-nowrap">{category.availableSeats} left!</span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2">
                                {userSubscription !== "free" && <span className="text-xs text-gray-400 line-through font-normal truncate">Rp {category.price.toLocaleString("id-ID")}</span>}
                                <div className="flex items-baseline gap-0.5 min-w-0">
                                  <span className="text-[10px] font-normal text-[#4A5043]">Rp</span>
                                  <span className="text-sm font-semibold text-[#2C3228] truncate">{Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}</span>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`
                                            h-[40px] w-[40px] rounded-lg flex flex-col items-center justify-center flex-shrink-0
                                            ${category.availableSeats <= 20 ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#F4F6F0] text-[#2C3228] border border-[#D3D9C9]"}
                                        `}>
                              <span className={`text-sm font-semibold ${category.availableSeats <= 20 ? "text-red-600" : "text-[#2C3228]"}`}>{category.availableSeats}</span>
                              <span className={`text-[8px] font-medium ${category.availableSeats <= 20 ? "text-red-500" : "text-[#4A5043]"}`}>seats</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-3xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <DialogTitle className="text-2xl font-bold text-[#2C3228] mb-6 sticky top-0 bg-white">Complete Your Booking</DialogTitle>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Name</label>
                  <input
                    type="text"
                    value={buyerData.name}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Email</label>
                  <input
                    type="email"
                    value={buyerData.email}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={buyerData.phone}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Identity Type</label>
                  <select
                    value={buyerData.identityType}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as TicketPurchase["identityType"] }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all">
                    <option value="KTP">KTP</option>
                    <option value="Passport">Passport</option>
                    <option value="SIM">SIM</option>
                    <option value="Student">Student ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Identity Document</label>
                  <div className="space-y-3">
                    {showCamera ? (
                      <div className="relative">
                        <Webcam
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full rounded-xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-2 border-white/70 rounded-lg w-[85%] h-[60%] relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white">⎯⎯⎯ Align ID card ⎯⎯⎯</div>
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00F5A0]" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00F5A0]" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00F5A0]" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00F5A0]" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                          <button
                            onClick={capture}
                            className="px-6 py-2 bg-[#8E2DE2] text-white rounded-lg hover:opacity-90 transition-opacity">
                            Capture
                          </button>
                          <button
                            onClick={() => setShowCamera(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {buyerData.identityDetails ? (
                          <div className="relative">
                            <Image
                              width={200}
                              height={200}
                              src={buyerData.identityDetails}
                              alt="Identity document"
                              className="w-full rounded-xl"
                            />
                            <button
                              onClick={() => setBuyerData((prev) => ({ ...prev, identityDetails: "" }))}
                              className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowCamera(true)}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
                              Open Camera
                            </button>
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <span className="block px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 text-center cursor-pointer">
                                Upload File
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-8 sticky bottom-0 bg-white pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-[#D3D9C9] rounded-xl text-[#4A5043] hover:bg-[#F4F6F0] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPurchase}
                    disabled={!buyerData.email || !buyerData.name || !buyerData.phone || !buyerData.identityDetails}
                    className="flex-1 px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
