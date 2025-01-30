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
    <div className="flex-1 p-7">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-2xl overflow-hidden">
          <div className="relative h-96 w-full">
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">{ticket.name}</h1>
            <p className="mt-4 text-gray-400">{ticket.description}</p>

            {/* Event Details Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#00F5A0]">Date & Time</h3>
                  <p className="text-white">
                    {new Date(ticket.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400">{ticket.time}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#00F5A0]">Venue</h3>
                  <p className="text-white">{ticket.venue}</p>
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

            {/* Seat Categories */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold text-white">Available Categories</h2>
              <div className="grid grid-cols-1 gap-4">
                {ticket.seatCategories.map((category) => (
                  <div
                    key={category.name}
                    className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-[#00F5A0] font-bold">Rp {category.price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Available Seats</p>
                        <p className="text-lg font-bold text-white">{category.availableSeats}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleBuyTicket(category.name)}
                        disabled={category.availableSeats <= 0}
                        className={`w-full px-4 py-3 rounded-lg text-center ${
                          category.availableSeats > 0
                            ? "bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white hover:opacity-90 transition-opacity"
                            : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        }`}>
                        {category.availableSeats > 0 ? "Buy Ticket" : "Sold Out"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 p-4 bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Important Information</h2>
              <ul className="space-y-2 text-gray-400">
                <li>• Please arrive at least 30 minutes before the event starts</li>
                <li>• Bring valid identification matching your ticket details</li>
                <li>• Tickets are non-refundable and non-transferable</li>
                <li>• Photography and recording policies may apply</li>
              </ul>
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
