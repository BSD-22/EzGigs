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
    <div className="flex-1 p-5 md:p-7 overflow-auto bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-[#2C3228]">Ticket Marketplace</h1>
          <p className="text-[#4A5043] mt-2">Find and sell tickets for your favorite events 🎫</p>
        </div>
        <form action="/home/marketplace/sell" className="mt-4 md:mt-0">
          <button
            type="submit"
            className="bg-[#4A5043] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl hover:bg-[#2C3228] transition-colors">
            Sell Your Ticket
          </button>
        </form>
      </div>

      <SearchBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 md:mt-8">
        {listings?.map((listing) => (
          <div key={listing._id.toString()} className="group relative">
            <div className="relative flex flex-col h-auto bg-[#2C3228] rounded-2xl overflow-hidden">
              {/* Background Image */}
              <div className="relative h-[180px] sm:h-[200px]">
                <Image
                  src={listing.ticket.image}
                  alt={listing.ticket.name}
                  fill
                  className="object-cover opacity-40 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0" />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Top Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      {listing.categoryName}
                    </span>
                    <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                      Seat {listing.seatNumber}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-[#D3D9C9] transition-colors">
                    {listing.ticket.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[#D3D9C9] text-sm">
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate max-w-[100px] sm:max-w-[140px]">{listing.ticket.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>
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

                {/* Price Section */}
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-lg font-bold text-white whitespace-nowrap">
                      Rp {listing.price.toLocaleString("id-ID")}
                    </div>
                    {listing.price !== listing.ticket.seatCategories[0].price && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs line-through text-[#D3D9C9]/70 whitespace-nowrap">
                          Rp {listing.ticket.seatCategories[0].price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs">
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

                  {/* Chat Button */}
                  <Link
                    href={`/home/marketplace/chat/${listing.user._id.toString()}`}
                    className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Chat</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;