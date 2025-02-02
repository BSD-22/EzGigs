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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6">
        {listings?.map((listing) => (
          <div key={listing._id.toString()} className="group relative h-full">
            <div className="relative flex flex-col h-full bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E8EDE1]">
              {/* Chat Button - Hanya tampil jika bukan ticket milik user sendiri */}
              {listing.user._id.toString() !== currentUser?.id && (
                <Link
                  href={`/home/marketplace/chat/${listing.user._id.toString()}`}
                  className="absolute top-2 right-2 z-10 bg-white text-[#4A5043] px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-sm hover:bg-[#4A5043] hover:text-white transition-all duration-300 flex items-center gap-1 shrink-0 shadow-sm border border-[#E8EDE1]"
                >
                  <span>💬</span>
                  <span>Chat</span>
                </Link>
              )}

              {/* Ticket Detail Link */}
              <Link 
                href={`/home/marketplace/${listing._id}`}
                className="flex flex-col flex-1 cursor-pointer"
              >
                {/* Background Image dengan judul dan lokasi */}
                <div className="relative h-[120px] sm:h-[140px] md:h-[160px]">
                  <Image
                    src={listing.ticket.image}
                    alt={listing.ticket.name}
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Judul dan Lokasi */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                    <h3 className="text-sm md:text-lg font-bold text-white line-clamp-1 group-hover:text-white/90 transition-colors">
                      {listing.ticket.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/90 text-[10px] md:text-xs mt-1">
                      <span>📍</span>
                      <span className="truncate">{listing.ticket.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-3">
                  {/* Event Info Section */}
                  <div className="flex flex-col w-full">
                    <div className="flex flex-wrap items-center gap-1 md:gap-1.5 mb-1.5 md:mb-2">
                      <span className="px-1.5 md:px-2 py-0.5 bg-[#4A5043]/5 rounded-full text-[10px] md:text-xs font-medium text-[#4A5043]">
                        {listing.categoryName}
                      </span>
                      <span className="px-1.5 md:px-2 py-0.5 bg-emerald-50 rounded-full text-[10px] md:text-xs font-medium text-emerald-600">
                        Seat {listing.seatNumber}
                      </span>
                    </div>
                    <div className="bg-[#F4F6F0] px-1.5 sm:px-4 py-1 sm:py-3 flex items-center justify-between text-[10px] sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="font-medium text-[#2C3228]">⏰</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-3">
                          <div className="flex items-center gap-1 bg-[#2C3228] text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full">
                            <span className="text-[8px] sm:text-xs">🎭</span>
                            <span className="text-[8px] sm:text-sm font-medium">
                              {new Date(listing.ticket.date).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    <div className="flex flex-col w-full gap-1.5 md:gap-2 text-[#4A5043] text-[10px] md:text-sm">
                      <div className="bg-[#F4F6F0] px-1.5 sm:px-4 py-1 sm:py-3 flex items-center justify-between text-[10px] sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          <span className="font-medium text-[#2C3228]">📅</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-3">
                          <div className="flex items-center gap-1 bg-[#2C3228] text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full">
                            <span className="text-[8px] sm:text-sm font-medium">
                              {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="px-2 md:px-4 pb-2 md:pb-4">
                <div className="h-px bg-[#E8EDE1] mb-2" />
                
                {/* Seller Info & Price Section */}
                <div className="flex items-start justify-between">
                  {/* Seller Info */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#4A5043] flex items-center justify-center">
                        <span className="text-[9px] md:text-xs font-medium text-white">
                          {listing.user.name[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs text-[#4A5043] truncate max-w-[80px] md:max-w-[120px]">
                        {listing.user.name}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col">
                      <div className="text-xs md:text-lg font-bold text-[#2C3228]">
                        Rp {listing.price.toLocaleString("id-ID")}
                      </div>
                      {listing.price !== listing.ticket.seatCategories[0].price && (
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <span className="text-[8px] md:text-xs line-through text-[#4A5043]/70">
                            Rp {listing.ticket.seatCategories[0].price.toLocaleString("id-ID")}
                          </span>
                          {listing.price < listing.ticket.seatCategories[0].price ? (
                            <span className="text-[7px] md:text-[10px] text-green-600 font-medium bg-green-50 px-1 md:px-1.5 py-0.5 rounded-full">
                              -{Math.round((1 - listing.price / listing.ticket.seatCategories[0].price) * 100)}%
                            </span>
                          ) : (
                            <span className="text-[7px] md:text-[10px] text-amber-600 font-medium bg-amber-50 px-1 md:px-1.5 py-0.5 rounded-full">
                              +{Math.round((listing.price / listing.ticket.seatCategories[0].price - 1) * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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