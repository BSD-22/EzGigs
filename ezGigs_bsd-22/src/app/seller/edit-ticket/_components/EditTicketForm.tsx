"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import { SeatCategory } from "@/db/models/ticket";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { SerializedTicket } from "@/db/models/ticket";

interface EditTicketFormProps {
  sellerId: string;
  initialData: SerializedTicket;
}

type SeatCategoryInput = Omit<SeatCategory, "availableSeats" | "soldSeats">;
const EditTicketForm = ({ sellerId, initialData }: EditTicketFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    venue: initialData.venue,
    date: initialData.date,
    time: initialData.time,
    description: initialData.description,
    image: initialData.image,
    location: initialData.location || {
      latitude: -6.2088,
      longitude: 106.8456,
    },
    seatCategories: initialData.seatCategories.map((cat) => ({
      name: cat.name,
      price: cat.price,
      totalSeats: cat.totalSeats,
    })) as SeatCategoryInput[],
  });
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const latLng = e.latLng;
    if (latLng !== null) {
      setFormData((prev) => ({
        ...prev,
        location: {
          latitude: latLng.lat(),
          longitude: latLng.lng(),
        },
      }));
    }
  };
  const googleMapsScript = useMemo(() => {
    if (!isLoaded) return null;
    return (
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat: formData.location.latitude, lng: formData.location.longitude }}
        zoom={15}
        onClick={handleMapClick}>
        <Marker position={{ lat: formData.location.latitude, lng: formData.location.longitude }} />
      </GoogleMap>
    );
  }, [isLoaded, formData.location]);
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
      const res = await fetch(`${baseUrl}/api/ticket/${initialData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sellerId,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (res.ok) {
        router.push("/seller/all-tickets");
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal mengupdate tiket:", error);
      alert("Terjadi kesalahan saat mengupdate tiket");
    } finally {
      setLoading(false);
    }
  };
  const inputClasses =
    "w-full px-4 py-2 rounded-xl border border-[#FF8008]/20 focus:border-[#FF8008] focus:ring-2 focus:ring-[#FF8008]/20 outline-none transition-colors bg-white/80 backdrop-blur-sm shadow-sm text-[#2D1810] placeholder-gray-400";
  const labelClasses = "block text-[#2D1810]/80 font-medium mb-2 text-sm";
  const buttonClasses = "w-full px-4 py-2 rounded-xl border border-[#FF8008]/30 text-[#FF8008] hover:bg-[#FF8008]/5 active:bg-[#FF8008]/10 transition-colors";
  const submitButtonClasses =
    "w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF8008] to-[#FFA03C] text-white font-medium hover:opacity-90 active:opacity-80 transition-all shadow-lg shadow-[#FF8008]/10";
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6">
      <div>
        <label className={labelClasses}>Nama Event</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className={labelClasses}>Venue</label>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className={labelClasses}>Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClasses} min-h-[100px]`}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Tanggal</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Waktu</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
      </div>
      <div>
        <label className={labelClasses}>URL Gambar</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className={labelClasses}>Lokasi Event</label>
        <p className="text-sm text-gray-400 mb-2">Klik pada peta untuk mengatur lokasi event</p>
        <div className="rounded-lg overflow-hidden border border-[#8E2DE2]/20">{googleMapsScript}</div>
      </div>
      <div>
        <label className={labelClasses}>Kategori Tiket</label>
        {formData.seatCategories.map((category, index) => (
          <div
            key={index}
            className="mb-4 p-4 rounded-xl border border-[#FF8008]/20 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className={labelClasses}>Nama Kategori</label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleSeatCategoryChange(index, "name", e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Harga</label>
                <input
                  type="number"
                  value={category.price}
                  onChange={(e) => handleSeatCategoryChange(index, "price", e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Total Kursi</label>
                <input
                  type="number"
                  value={category.totalSeats}
                  onChange={(e) => handleSeatCategoryChange(index, "totalSeats", Number(e.target.value))}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeSeatCategory(index)}
              className={buttonClasses}>
              Hapus Kategori
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSeatCategory}
          className={buttonClasses}>
          Tambah Kategori
        </button>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 p-3 bg-black/40 text-white font-semibold rounded-lg hover:bg-black/60 transition-colors">
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={submitButtonClasses}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
};
export default EditTicketForm;
