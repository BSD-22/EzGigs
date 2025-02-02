"use client";

import { useEffect, useState, useCallback, useRef, useMemo, use } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Webcam from "react-webcam";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { toast } from "react-hot-toast";
import { TicketDetailSkeleton } from "@/components/skeletons/TicketDetailSkeleton";

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
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
      const res = await fetch(`/api/ticket/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch ticket');
      setTicket(json?.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Gagal mengambil data tiket 😢");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

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
      <div className="fixed left-0 top-0 h-full z-50">{/* Your existing sidebar component */}</div>

      <div className="flex-1">
        {" "}
        {/* Removed margin */}
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
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all">
                ← Back
              </button>

              {/* Hero Content */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="px-3 py-1 bg-[#8E2DE2] rounded-full text-xs sm:text-sm text-white">
                        {new Date(ticket.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="px-3 py-1 bg-[#00F5A0] rounded-full text-xs sm:text-sm text-black">{ticket.time}</div>
                    </div>
                    <h1 className="text-2xl sm:text-5xl font-bold text-white mb-2">{ticket.name}</h1>
                    <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                      <span>📍</span>
                      {ticket.venue}
                    </p>
                  </div>
                  {userSubscription !== "free" && <div className="flex-shrink-0">{getDiscountBadge()}</div>}
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
                      <div className="prose prose-sm sm:prose-base text-[#4A5043]">{ticket.description}</div>
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
                            className="w-full group hover:bg-[#F4F6F0] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#D3D9C9] transition-all">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col items-start">
                                <span className="text-base sm:text-lg font-semibold text-[#2C3228] mb-1">{category.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  <span className="text-xs sm:text-sm text-[#4A5043]">{category.availableSeats} seats</span>
                                </div>
                              </div>
                              <div className="text-right">
                                {userSubscription !== "free" && <p className="text-xs sm:text-sm text-gray-400 line-through mb-0.5">Rp {category.price.toLocaleString("id-ID")}</p>}
                                <p className="text-base sm:text-lg font-bold text-[#2C3228]">Rp {Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}</p>
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

            {/* Purchase Modal - Updated Design */}
            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              className="relative z-50">
              <div
                className="fixed inset-0 bg-black/30"
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
                          onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as typeof buyerData.identityType }))}
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
                                  <img
                                    src={buyerData.identityDetails}
                                    alt="Identity document"
                                    className="w-full h-auto rounded-xl object-cover"
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
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
