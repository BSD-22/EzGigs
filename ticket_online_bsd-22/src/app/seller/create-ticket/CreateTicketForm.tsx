"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";

interface CreateTicketFormProps {
  sellerId: string;
}

const CreateTicketForm = ({ sellerId }: CreateTicketFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    seats: "",
    venue: "",
    date: "",
    time: "",
    description: "",
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(baseUrl + "/api/ticket/seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          seats: Number(formData.seats),
          sellerId,
        }),
      });

      const data = await res.json();

      if (data.statusCode === 201) {
        router.push("/seller/all-tickets");
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Event Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Price (Rp)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Available Seats</label>
          <input
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
            required
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Venue</label>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2] h-32"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg focus:outline-none focus:border-[#8E2DE2]"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 bg-black/40 text-white font-semibold rounded-lg hover:bg-black/60 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white font-semibold rounded-lg transition-opacity ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
};

export default CreateTicketForm;
