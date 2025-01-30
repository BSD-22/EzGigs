"use client";

import { useEffect, useState } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { TicketPurchase } from "@/db/models/ticket";
// Add these imports at the top
import Webcam from "react-webcam";
import { useCallback, useRef } from "react";

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; category: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const [buyerData, setBuyerData] = useState({
    email: "",
    name: "",
    phone: "",
    identityType: "KTP" as "KTP" | "Passport" | "SIM" | "Student",
    identityDetails: "",
  });

  const handleTicketClick = (ticketId: string) => {
    router.push(`/home/ticket/${ticketId}`);
  };

  // Add the missing handleBuyTicket function
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

  // Update handleSubmitPurchase
  const handleSubmitPurchase = async () => {
    if (!selectedTicket) return;

    try {
      // Store buyer data in localStorage
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
          ...buyerData,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const stripeData = json.data;
        setIsModalOpen(false);
        router.push(stripeData.url); // Fix: access url through stripeData.data.url
      } else {
        console.error("Payment creation failed:", json.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  useEffect(() => {
    fetchTickets();

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success");
    const sessionId = urlParams.get("session_id");
    const purchaseId = urlParams.get("purchase_id");

    if (isSuccess && sessionId && purchaseId) {
      verifyPayment(sessionId, purchaseId);
    }
  }, []);

  const verifyPayment = async (sessionId: string, purchaseId: string) => {
    try {
      const verifyRes = await fetch(`/api/ticket/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, purchaseId }),
      });

      if (!verifyRes.ok) {
        console.error("Payment verification failed");
        return;
      }

      const userRes = await fetch("/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!userRes.ok) {
        console.error("Failed to fetch user data");
        return;
      }

      const userData = await userRes.json();

      const storedBuyerData = localStorage.getItem("tempBuyerData");
      const buyerDataForEmail = storedBuyerData ? JSON.parse(storedBuyerData) : buyerData;

      const eTicketRes = await fetch("/api/ticket/send-eticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: userData.data,
          buyerData: buyerDataForEmail,
          purchaseId,
        }),
      });

      if (!eTicketRes.ok) {
        console.error("Failed to send e-ticket");
      }
      localStorage.removeItem("tempBuyerData");
    } catch (error) {
      console.error("Error in payment verification process:", error);
    } finally {
      router.push("/home/ticket");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
        {/* Main Content */}
        <div className="flex-1 p-7 overflow-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-5xl font-black text-[#2C3228]">
                        Upcoming Events
                    </h1>
                    <p className="text-[#4A5043] mt-2">Discover and book your next unforgettable experience 🎉</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tickets?.map((ticket) => (
                    <div
                        key={ticket._id.toString()}
                        onClick={() => handleTicketClick(ticket._id.toString())}
                        className="group bg-white rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer border border-[#D3D9C9]"
                    >
                        {/* Image Container */}
                        <div className="relative h-[280px] w-full overflow-hidden bg-[#2C3228]">
                            <Image
                                src={ticket.image}
                                alt={ticket.name}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2C3228] to-transparent opacity-60" />
                            
                            {/* Event Status */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="inline-flex items-center gap-1.5 bg-[#4A5043] text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Live Event
                                </span>
                            </div>

                            {/* Date Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 text-center min-w-[80px]">
                                    <p className="text-[#2C3228] text-2xl font-bold">
                                        {new Date(ticket.date).getDate()}
                                    </p>
                                    <p className="text-[#4A5043] text-sm font-medium">
                                        {new Date(ticket.date).toLocaleDateString("id-ID", { month: "short" })}
                                    </p>
                                </div>
                            </div>

                            {/* Event Title on Image */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#D3D9C9] transition-colors">
                                    {ticket.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[#D3D9C9]">📍</span>
                                        {ticket.venue}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[#D3D9C9]">⌚</span>
                                        {ticket.time}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Categories */}
                        <div className="p-6">
                            <div className="space-y-3">
                                {ticket.seatCategories.map((category) => (
                                    <button
                                        key={category.name}
                                        disabled={category.availableSeats <= 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBuyTicket(ticket._id.toString(), category.name);
                                        }}
                                        className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                                            category.availableSeats > 0 
                                                ? "bg-[#F4F6F0] hover:bg-[#E8EDE1] border border-[#D3D9C9]" 
                                                : "bg-gray-100 cursor-not-allowed opacity-60"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-[#2C3228]">{category.name}</p>
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-[#4A5043]/10 text-[#4A5043] rounded-full">
                                                        {category.availableSeats} left
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#4A5043] mt-0.5">
                                                    Rp {category.price.toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-[#4A5043]/10 flex items-center justify-center">
                                                <span className="text-[#4A5043]">→</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Purchase Modal - Light Theme */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
                    <DialogTitle className="text-2xl font-bold text-[#2C3228] mb-6">Complete Your Booking</DialogTitle>
                    
                    {/* Form fields with updated styling */}
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
                                className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                            >
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
                                                className="px-6 py-2 bg-[#8E2DE2] text-white rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Capture
                                            </button>
                                            <button
                                                onClick={() => setShowCamera(false)}
                                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                                            >
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
                                                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowCamera(true)}
                                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
                                                >
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
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-[#D3D9C9] rounded-xl text-[#4A5043] hover:bg-[#F4F6F0] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitPurchase}
                                disabled={!buyerData.email || !buyerData.name || !buyerData.phone || !buyerData.identityDetails}
                                className="flex-1 px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    </div>
  );
}
