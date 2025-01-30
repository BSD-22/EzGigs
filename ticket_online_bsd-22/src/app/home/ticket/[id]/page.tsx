"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { TicketModel } from "@/db/models/ticket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Webcam from "react-webcam";

const TicketDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const [buyerData, setBuyerData] = useState({
    email: "",
    name: "",
    phone: "",
    identityType: "KTP" as "KTP" | "Passport" | "SIM" | "Student",
    identityDetails: "",
  });

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

  if (!ticket) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7 bg-gradient-to-b from-[#F4F6F0] to-[#E8EDE1] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Card Container */}
        <div className="bg-[#FAFBF6] rounded-2xl overflow-hidden border border-[#D3D9C9] shadow-xl">
          {/* Hero Section */}
          <div className="relative h-[400px]">
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFBF6] via-black/20 to-transparent" />
            
            {/* Floating Event Info */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="flex justify-between items-end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-[#4A5043] text-white text-sm font-medium rounded-full">
                      Live Event
                    </span>
                    <span className="px-4 py-1 bg-[#656D5D] text-white text-sm font-medium rounded-full">
                      Concert
                    </span>
                  </div>
                  <h1 className="text-6xl font-black text-[#2C3228] tracking-tight">
                    {ticket.name}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-[#4A5043] text-lg">Starting from</p>
                  <p className="text-3xl font-bold text-[#2C3228]">
                    Rp {Math.min(...ticket.seatCategories.map(cat => cat.price)).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-10">
            {/* Event Details Grid */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Date</p>
                    <p className="text-[#2C3228] font-medium">
                      {new Date(ticket.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#00F5A0] mb-4">Price Range</h3>
                <p className="text-white">
                  From Rp {Math.min(...ticket.seatCategories.map((cat) => cat.price)).toLocaleString("id-ID")} to Rp{" "}
                  {Math.max(...ticket.seatCategories.map((cat) => cat.price)).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⌚</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Time</p>
                    <p className="text-[#2C3228] font-medium">{ticket.time} WIB</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Venue</p>
                    <p className="text-[#2C3228] font-medium">{ticket.venue}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              {/* Left Column - Description */}
              <div>
                <h3 className="text-xl font-bold text-[#2C3228] mb-4">About This Event</h3>
                <p className="text-[#4A5043] leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Right Column - Ticket Categories */}
              <div>
                <h3 className="text-xl font-bold text-[#2C3228] mb-6">Available Tickets</h3>
                <div className="space-y-4">
                  {ticket.seatCategories.map((category) => (
                    <div 
                      key={category.name}
                      className="group bg-[#E8EDE1] p-6 rounded-xl border border-[#D3D9C9] hover:bg-[#DFE5D6] transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#2C3228] text-lg">{category.name}</p>
                          <p className="text-[#4A5043] text-sm">Limited seats available</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#4A5043]">
                            Rp {category.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-8 w-full py-4 bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#2C3228]/25">
                  Get Your Tickets Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md">
            <DialogTitle className="text-xl font-bold mb-4 text-white">Enter Your Details</DialogTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={buyerData.name}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={buyerData.email}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={buyerData.phone}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Identity Type</label>
                <select
                  value={buyerData.identityType}
                  onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as typeof buyerData.identityType }))}
                  className="w-full bg-black/40 border border-[#8E2DE2]/20 rounded-lg px-4 py-2 text-white">
                  <option value="KTP">KTP</option>
                  <option value="Passport">Passport</option>
                  <option value="SIM">SIM</option>
                  <option value="Student">Student ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Identity Document</label>
                <div className="space-y-2">
                  {showCamera ? (
                    <div className="relative">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full rounded-lg"
                      />
                      <button
                        onClick={capture}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#8E2DE2] rounded-lg text-white">
                        Capture
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowCamera(true)}
                        className="w-full px-4 py-2 bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] rounded-lg text-white transition-colors">
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
                          className="block w-full px-4 py-2 bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] rounded-lg text-white transition-colors text-center cursor-pointer">
                          Upload Photo
                        </label>
                      </div>
                    </div>
                  )}
                  {buyerData.identityDetails && (
                    <div className="mt-2">
                      <Image
                        width={200}
                        height={200}
                        src={buyerData.identityDetails}
                        alt="Identity preview"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSubmitPurchase}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
                  Proceed to Payment
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default TicketDetail;
