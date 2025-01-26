import { getAllMarketplace } from "@/db/models/marketplace";
import Image from "next/image";
import SearchBar from "./SearchBar";

const Marketplace = async () => {
  const { data: listings } = await getAllMarketplace();

  return (
    <div className="flex-1 p-7 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Ticket Marketplace 🎫</h1>
        <a
          href="/home/marketplace/sell"
          className="bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
          Sell Your Ticket
        </a>
      </div>

      <SearchBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {listings?.map((listing) => (
          <div
            key={listing._id.toString()}
            className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-all duration-300 group">
            <div className="relative h-48 w-full">
              <Image
                src={listing.ticket.image}
                alt={listing.ticket.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-[#00F5A0] font-bold">Rp {listing.ticket.price.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-[#00F5A0] transition-colors">{listing.ticket.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#00F5A0] flex items-center justify-center text-xs">{listing.user.name[0].toUpperCase()}</div>
                <span className="text-sm text-gray-400">Sold by {listing.user.name}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{listing.ticket.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💺</span>
                  <span>Seat {listing.ticket.seats}</span>
                </div>
              </div>
              <a
                href={`/marketplace/${listing._id}`}
                className="mt-4 w-full bg-[#8E2DE2]/20 hover:bg-[#8E2DE2] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                View Details
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
