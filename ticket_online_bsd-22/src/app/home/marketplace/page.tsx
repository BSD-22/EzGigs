import { getAllMarketplace } from "@/db/models/marketplace";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { cookies } from "next/headers";
import { decodeToken } from "@/utils/jose";
import { JosePayload } from "@/types";

const Marketplace = async () => {
  const cookieStore = await cookies();
  const decodedToken = decodeToken<JosePayload>(cookieStore.get("token")?.value as string);

  const { data: listings } = await getAllMarketplace();

  const currentUser = decodedToken;

  return (
    <div className="flex-1 p-7 overflow-auto bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-black text-[#2C3228]">Ticket Marketplace</h1>
          <p className="text-[#4A5043] mt-2">Find and sell tickets for your favorite events 🎫</p>
        </div>
        <form action="/home/marketplace/sell">
          <button
            type="submit"
            className="bg-[#4A5043] text-white px-6 py-3 rounded-xl hover:bg-[#2C3228] transition-colors">
            Sell Your Ticket
          </button>
        </form>
      </div>

      <SearchBar />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        {listings?.map((listing) => (
          <a
            href={`/home/marketplace/${listing._id.toString()}`}
            key={listing._id.toString()}
            className="group relative flex h-[200px] bg-[#2C3228] rounded-2xl overflow-hidden"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={listing.ticket.image}
                alt={listing.ticket.name}
                fill
                className="object-cover opacity-40 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C3228] via-[#2C3228]/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative flex-1 flex">
              {/* Left Content */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                {/* Top Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      {listing.categoryName}
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                      Seat {listing.seatNumber}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#D3D9C9] transition-colors">
                    {listing.ticket.name}
                  </h3>

                  <div className="flex items-center gap-3 text-[#D3D9C9]">
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="text-xs truncate max-w-[120px]">{listing.ticket.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span className="text-xs">
                        {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {listing.user.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-[#D3D9C9] truncate">{listing.user.name}</span>
                </div>
              </div>

              {/* Right Content - Price Section */}
              <div className="w-[160px] p-5 flex flex-col items-end justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white mb-0.5">
                    Rp {listing.price.toLocaleString("id-ID")}
                  </div>
                  {listing.price !== listing.ticket.seatCategories[0].price && (
                    <div>
                      <span className="text-xs line-through text-[#D3D9C9]/70">
                        Rp {listing.ticket.seatCategories[0].price.toLocaleString("id-ID")}
                      </span>
                      <span className="ml-1.5 text-xs">
                        {listing.price < listing.ticket.seatCategories[0].price ? (
                          <span className="text-green-400 font-medium">
                            -{Math.round((1 - listing.price / listing.ticket.seatCategories[0].price) * 100)}%
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">
                            +{Math.round((listing.price / listing.ticket.seatCategories[0].price - 1) * 100)}%
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
