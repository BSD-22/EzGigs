"use client";

import { useEffect, useState, useRef } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { TicketPurchase } from "@/db/models/ticket";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import GridView from "./_components/GridView";
import ListView from "./_components/ListView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TicketsSkeleton } from "@/components/skeletons/TicketsSkeleton";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; category: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
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
  const [userSubscription, setUserSubscription] = useState<"free" | "premium" | "vip">("free");

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

  const verifyIdentity = async (faceImage: string, identityImage: string) => {
    try {
      const verifyRes = await fetch("/api/verify-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceImage,
          identityImage,
        }),
      });

      const result = await verifyRes.json();
      console.log("Verification result:", result);

      if (!verifyRes.ok) {
        throw new Error("API request failed");
      }

      return result;
    } catch (error) {
      console.error("Error in verifyIdentity:", error);
      return { isMatch: false, message: "Network error occurred" };
    }
  };

  const handleCapturePhoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture photo. Please try again.");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("Verifying your identity...");

    try {
      setBuyerData((prev) => ({ ...prev, identityDetails: imageSrc }));
      const result = await verifyIdentity(imageSrc, imageSrc);

      setBuyerData((prev) => ({ ...prev, identityDetails: "" }));

      if (result.isMatch) {
        setIsIdentityVerified(true);
        setBuyerData((prev) => ({ ...prev, identityDetails: imageSrc }));
        toast.success("Identity verified successfully!");
        setShowCamera(false);
      } else {
        setIsIdentityVerified(false);
        toast.error(result.message || "Verification failed. Please try again.", {
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setIsIdentityVerified(false);
      setBuyerData((prev) => ({ ...prev, identityDetails: "" }));
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
      setVerificationMessage("");
    }
  };

  const handleSubmitPurchase = async () => {
    if (!isIdentityVerified) {
      toast.error("Please complete identity verification first");
      return;
    }

    if (!selectedTicket || !buyerData.identityDetails) {
      toast.error("Please provide all required information");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("Processing your purchase...");

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
      setIsVerifying(false);
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
    } finally {
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
      {isLoading ? (
        <TicketsSkeleton viewMode={viewMode} />
      ) : (
        <div className="flex-1 p-3 sm:p-7 overflow-auto">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {filteredAndSortedTickets.map((ticket) => (
                <div
                  key={ticket._id.toString()}
                  className="group h-full">
                  <div
                    onClick={() => handleTicketClick(ticket._id.toString())}
                    className="bg-white rounded-lg sm:rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#D3D9C9] h-full">
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
      )}
      <ToastContainer />
      <div className="flex-1 p-3 sm:p-7 overflow-auto">
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
            userSubscription={userSubscription}
          />
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
                <div className="space-y-3">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[#4A5043] mb-2">Identity Verification</label>
                    {buyerData.identityDetails ? (
                      <div className="relative">
                        <Image
                          width={400}
                          height={300}
                          src={buyerData.identityDetails}
                          alt="Identity verification photo"
                          className="w-full rounded-xl"
                        />
                        <button
                          onClick={() => {
                            setBuyerData((prev) => ({ ...prev, identityDetails: "" }));
                            setIsIdentityVerified(false);
                          }}
                          className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCamera(true)}
                        className="w-full px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors">
                        Take Verification Photo
                      </button>
                    )}

                    <div className="text-sm text-gray-600">Please take a photo of yourself holding your ID card. Make sure both your face and the ID photo are clearly visible.</div>

                    {isIdentityVerified && <div className="p-3 bg-green-50 text-green-700 rounded-xl">✓ Identity verified successfully</div>}
                  </div>
                </div>
                {isVerifying && (
                  <div className="text-center py-4 bg-[#F4F6F0] rounded-xl">
                    <div className="animate-spin h-8 w-8 border-4 border-[#4A5043] border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-[#4A5043]">{verificationMessage}</p>
                  </div>
                )}
                <div className="flex gap-3 mt-8 sticky bottom-0 bg-white pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-[#D3D9C9] rounded-xl text-[#4A5043] hover:bg-[#F4F6F0] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPurchase}
                    disabled={!isIdentityVerified || !buyerData.email || !buyerData.name || !buyerData.phone || isVerifying}
                    className="flex-1 px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isVerifying ? "Verifying..." : "Continue to Payment"}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <Dialog
        open={showCamera}
        onClose={() => setShowCamera(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-3xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-[#2C3228] mb-4">Identity Verification</DialogTitle>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Please position your face on the left and your ID card on the right</p>

                <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  {!buyerData.identityDetails ? (
                    <>
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                      />
                      {/* Guide overlay */}
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 border-r-2 border-white/50">
                          <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">Face</div>
                          <div className="h-full border-2 border-dashed border-white/50 m-2 rounded"></div>
                        </div>
                        <div className="w-1/2">
                          <div className="absolute top-2 right-2 text-white text-sm bg-black/50 px-2 py-1 rounded">ID Card</div>
                          <div className="h-full border-2 border-dashed border-white/50 m-2 rounded"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <button
                          onClick={handleCapturePhoto}
                          disabled={isVerifying}
                          className="px-6 py-2 bg-[#8E2DE2] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                          {isVerifying ? "Verifying..." : "Capture Photo"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Image
                        src={buyerData.identityDetails}
                        alt="Verification photo"
                        width={400}
                        height={300}
                        className="w-full rounded-xl"
                      />
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setBuyerData((prev) => ({ ...prev, identityDetails: "" }));
                            setIsIdentityVerified(false);
                          }}
                          className="px-6 py-2 border border-[#8E2DE2] text-[#8E2DE2] rounded-lg hover:bg-[#8E2DE2] hover:text-white transition-all">
                          Retake Photo
                        </button>
                        <button
                          onClick={() => setShowCamera(false)}
                          className="px-6 py-2 bg-[#8E2DE2] text-white rounded-lg hover:opacity-90 transition-opacity">
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Instructions:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Position your face clearly in the left box</li>
                    <li>Hold your ID card in the right box</li>
                    <li>Ensure good lighting and clear visibility</li>
                    <li>Keep steady while taking the photo</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
