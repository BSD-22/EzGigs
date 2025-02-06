"use client";

import { useEffect, useState, useMemo, use } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TicketDetailSkeleton } from "@/components/skeletons/TicketDetailSkeleton";
import TicketPurchaseModal from "@/components/TicketPurchaseModal";
import { TicketPurchase } from "@/db/models/ticket";
import { Libraries } from "@react-google-maps/api";

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

// Add this constant at the top level
const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

const TicketDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userSubscription, setUserSubscription] = useState<"free" | "premium" | "vip">("free");
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      if (!res.ok) throw new Error(json.message || "Failed to fetch ticket");
      setTicket(json?.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Failed to fetch ticket data 😢");
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

  const handleSubmitPurchase = async (buyerData: Omit<TicketPurchase, "_id" | "ticketId" | "categoryName" | "seatNumber" | "price" | "paymentStatus" | "paymentIntentId" | "purchaseDate">) => {
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
          buyerEmail: buyerData.buyerEmail,
          buyerName: buyerData.buyerName,
          buyerPhone: buyerData.buyerPhone,
          identityType: buyerData.identityType,
          identityDetails: buyerData.identityDetails,
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

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: "weekly",
    id: "script-loader", // Make sure this ID is consistent
  });

  const [, setMap] = useState<google.maps.Map | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    setMapLoaded(true);
  };

  const onMapUnmount = () => {
    setMap(null);
    setMapLoaded(false);
  };
  const googleMapsScript = useMemo(() => {
    if (!isLoaded || !ticket || !ticket.location) return null;

    return (
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat: ticket.location.latitude, lng: ticket.location.longitude }}
        zoom={15}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={mapOptions}>
        {mapLoaded && (
          <Marker
            position={{
              lat: ticket.location.latitude,
              lng: ticket.location.longitude,
            }}
          />
        )}
      </GoogleMap>
    );
  }, [isLoaded, ticket, mapLoaded]);

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
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
        <div className="fixed left-0 top-0 h-full z-50"></div>

        <div className="flex-1">
          <div className="flex-1">
            {/* Hero Section */}
            <div className="relative h-[250px] sm:h-[400px]">
              <Image
                src={ticket.image}
                alt={ticket.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all">
                ← Back
              </button>

              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] rounded-full text-xs sm:text-sm text-white font-medium flex items-center gap-2 shadow-lg shadow-[#8E2DE2]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {new Date(ticket.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="px-3 py-1.5 bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] rounded-full text-xs sm:text-sm text-white font-medium flex items-center gap-2 shadow-lg shadow-[#8E2DE2]/20">
                        <span>⌚</span>
                        <span>{ticket.time}</span>
                        <span className="text-white/80">WIB</span>
                      </div>
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

                    {ticket.location && (
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-lg sm:text-xl font-bold text-[#2C3228] mb-4">Event Location</h3>
                        <div className="w-full h-[400px] relative rounded-xl overflow-hidden">
                          {!isLoaded ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5043]"></div>
                            </div>
                          ) : loadError ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <p className="text-red-500">Error loading map</p>
                            </div>
                          ) : (
                            googleMapsScript
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Available Tickets Section */}
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
          </div>
        </div>
      </div>

      <TicketPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPurchase}
        requiresVerification={true}
      />
    </>
  );
};

export default TicketDetail;
