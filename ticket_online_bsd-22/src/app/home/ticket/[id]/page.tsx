"use client";

import { useEffect, useState, useCallback, useRef, useMemo, use } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Webcam from "react-webcam";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { toast } from "react-hot-toast";

const TicketDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data) {
        setUserSubscription(data.data.subscriptionType);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const calculateDiscountedPrice = (price: number) => {
    if (userSubscription === "premium") return price * 0.95;
    if (userSubscription === "vip") return price * 0.92;
    return price;
  };

  const getDiscountBadge = () => {
    if (userSubscription === "premium") {
      return <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">5% Member Discount</span>;
    }
    if (userSubscription === "vip") {
      return <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-medium">8% VIP Discount</span>;
    }
    return null;
  };

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/ticket/${id}`);
      const json = await res.json();
      setTicket(json?.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBuyTicket = (categoryName: string) => {
    setSelectedCategory(categoryName);
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

  const handleSubmitPurchase = async () => {
    if (!selectedCategory || !ticket) return;

    try {
      localStorage.setItem("tempBuyerData", JSON.stringify(buyerData));

      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ticketId: ticket._id.toString(),
          categoryName: selectedCategory,
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
      toast.error("Failed to process payment");
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const googleMapsScript = useMemo(() => {
    if (!isLoaded || !ticket || !ticket.location) return null;

    return (
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat: ticket.location.latitude, lng: ticket.location.longitude }}
        zoom={15}>
        <Marker position={{ lat: ticket.location.latitude, lng: ticket.location.longitude }} />
      </GoogleMap>
    );
  }, [isLoaded, ticket]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
        <div className="flex-1 p-4 sm:p-7">
          <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
        {/* Sidebar with high z-index but no content margin */}
        <div className="fixed left-0 top-0 h-full z-50">
            {/* Your existing sidebar component */}
        </div>

        <div className="flex-1"> {/* Removed margin */}
            {!ticket ? (
                <div className="flex-1 p-4 sm:p-7">
                    <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Loading...</h1>
                </div>
            ) : (
                <div className="flex-1">
                    {/* Hero Section */}
                    <div className="relative h-[250px] sm:h-[400px]">
                        <Image
                            src={ticket.image}
                            alt={ticket.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                        
                        {/* Back Button */}
                        <button 
                            onClick={() => router.back()}
                            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
                        >
                            ← Back
                        </button>

                        {/* Hero Content */}
                        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <div className="px-3 py-1 bg-[#8E2DE2] rounded-full text-xs sm:text-sm text-white">
                                            {new Date(ticket.date).toLocaleDateString("id-ID", { 
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="px-3 py-1 bg-[#00F5A0] rounded-full text-xs sm:text-sm text-black">
                                            {ticket.time}
                                        </div>
                                    </div>
                                    <h1 className="text-2xl sm:text-5xl font-bold text-white mb-2">{ticket.name}</h1>
                                    <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                                        <span>📍</span>
                                        {ticket.venue}
                                    </p>
                                </div>
                                {userSubscription !== "free" && (
                                    <div className="flex-shrink-0">
                                        {getDiscountBadge()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                                {/* Left Column - Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                                        <h3 className="text-lg sm:text-xl font-bold text-[#2C3228] mb-4">About This Event</h3>
                                        <div className="prose prose-sm sm:prose-base text-[#4A5043]">
                                            {ticket.description}
                                        </div>
                                    </div>

                                    {/* Location Map */}
                                    {ticket.location && (
                                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                                            <h3 className="text-lg sm:text-xl font-bold text-[#2C3228] mb-4">Event Location</h3>
                                            {googleMapsScript}
                                        </div>
                                    )}
                                </div>

                                {/* Updated Available Tickets Section */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm sticky top-4">
                                        <h3 className="text-base sm:text-xl font-bold text-[#2C3228] mb-3 sm:mb-4">Available Tickets</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            {ticket.seatCategories.map((category) => (
                                                <button
                                                    key={category.name}
                                                    onClick={() => handleBuyTicket(category.name)}
                                                    className="w-full group bg-[#F4F6F0] hover:bg-[#E8EDE1] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#D3D9C9] transition-all"
                                                >
                                                    <div className="flex justify-between items-center gap-2 sm:gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-[#2C3228] text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">
                                                                {category.name}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#4A5043]">
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        category.availableSeats <= 20 
                                                                            ? 'bg-red-500 animate-pulse' 
                                                                            : 'bg-green-500'
                                                                    }`}></span>
                                                                    <span className={
                                                                        category.availableSeats <= 20 
                                                                            ? 'text-red-600 font-medium' 
                                                                            : ''
                                                                    }>
                                                                        {category.availableSeats} seats
                                                                    </span>
                                                                </div>
                                                                {category.availableSeats <= 20 && (
                                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                                                        Selling fast!
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            {userSubscription !== "free" && (
                                                                <p className="text-xs sm:text-sm text-gray-500 line-through mb-0.5">
                                                                    Rp {category.price.toLocaleString("id-ID")}
                                                                </p>
                                                            )}
                                                            <p className="text-base sm:text-xl font-bold text-[#2C3228]">
                                                                Rp {Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Purchase Modal - Updated for Mobile */}
                    <Dialog
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel className="w-full max-w-md bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 shadow-xl">
                                <DialogTitle className="text-lg sm:text-xl font-bold mb-4 text-white">Enter Your Details</DialogTitle>
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Form Fields */}
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-400 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={buyerData.name}
                                            onChange={(e) => setBuyerData((prev) => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={buyerData.email}
                                            onChange={(e) => setBuyerData((prev) => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-400 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={buyerData.phone}
                                            onChange={(e) => setBuyerData((prev) => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white"
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-400 mb-1">Identity Type</label>
                                        <select
                                            value={buyerData.identityType}
                                            onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as typeof buyerData.identityType }))}
                                            className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white">
                                            <option value="KTP">KTP</option>
                                            <option value="Passport">Passport</option>
                                            <option value="SIM">SIM</option>
                                            <option value="Student">Student ID</option>
                                        </select>
                                    </div>
                                    {/* Camera/Upload Section */}
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-400 mb-1">Identity Document</label>
                                        <div className="space-y-2">
                                            {showCamera ? (
                                                <div className="relative rounded-lg overflow-hidden">
                                                    <Webcam
                                                        ref={webcamRef}
                                                        screenshotFormat="image/jpeg"
                                                        className="w-full"
                                                    />
                                                    <button
                                                        onClick={capture}
                                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#8E2DE2] rounded-lg text-sm text-white"
                                                    >
                                                        Capture
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setShowCamera(true)}
                                                        className="px-3 py-2 bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] rounded-lg text-xs sm:text-sm text-white transition-colors"
                                                    >
                                                        Take Photo
                                                    </button>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                            id="identity-upload"
                                                        />
                                                        <label
                                                            htmlFor="identity-upload"
                                                            className="block w-full px-3 py-2 bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] rounded-lg text-xs sm:text-sm text-white transition-colors text-center cursor-pointer"
                                                        >
                                                            Upload Photo
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmitPurchase}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-sm sm:text-base text-white font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                </div>
            )}
        </div>
    </div>
  );
};

export default TicketDetail;
