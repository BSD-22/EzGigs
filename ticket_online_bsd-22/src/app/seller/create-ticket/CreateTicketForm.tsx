"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import { SeatCategory } from "@/db/models/ticket";

interface CreateTicketFormProps {
  sellerId: string;
}

type SeatCategoryInput = Omit<SeatCategory, "availableSeats" | "soldSeats">;

const CreateTicketForm = ({ sellerId }: CreateTicketFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    date: "",
    time: "",
    description: "",
    image: "",
    seatCategories: [
      {
        name: "Regular",
        price: 0,
        totalSeats: 0,
      },
    ] as SeatCategoryInput[],
  });

  const handleSeatCategoryChange = (index: number, field: keyof SeatCategoryInput, value: string | number) => {
    const updatedCategories = [...formData.seatCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: typeof value === "string" && field === "price" ? Number(value) : value,
    };
    setFormData({ ...formData, seatCategories: updatedCategories });
  };

  const addSeatCategory = () => {
    setFormData({
      ...formData,
      seatCategories: [
        ...formData.seatCategories,
        {
          name: "",
          price: 0,
          totalSeats: 0,
        },
      ],
    });
  };

  const removeSeatCategory = (index: number) => {
    const updatedCategories = formData.seatCategories.filter((_, i) => i !== index);
    setFormData({ ...formData, seatCategories: updatedCategories });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/ticket/seller`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
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

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-400">Seat Categories</label>
          <button
            type="button"
            onClick={addSeatCategory}
            className="px-3 py-1 bg-[#8E2DE2]/20 text-[#8E2DE2] rounded-lg hover:bg-[#8E2DE2]/30">
            Add Category
          </button>
        </div>

        {formData.seatCategories.map((category, index) => (
          <div
            key={index}
            className="p-4 bg-black/20 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Category {index + 1}</h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSeatCategory(index)}
                  className="text-red-500 hover:text-red-400">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleSeatCategoryChange(index, "name", e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price (Rp)</label>
                <input
                  type="number"
                  value={category.price}
                  onChange={(e) => handleSeatCategoryChange(index, "price", e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Seats</label>
                <input
                  type="number"
                  value={category.totalSeats}
                  onChange={(e) => handleSeatCategoryChange(index, "totalSeats", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-[#8E2DE2]/20 rounded-lg"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>
        ))}
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
