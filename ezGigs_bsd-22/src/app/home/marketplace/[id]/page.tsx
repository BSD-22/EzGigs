import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import BuyTicketButton from "./BuyTicketButton";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMarketplaceById } from "@/db/models/marketplace";

const MarketplaceTicketDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { data: listing } = await getMarketplaceById(id);

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  let currentUserId: string | undefined;

  if (token) {
    const payload = await verifyToken<JosePayload>(token.value);
    currentUserId = payload.id;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">😢</div>
          <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-[#bc4e9c] to-[#f80759] text-transparent bg-clip-text">Listing Not Found</h1>
          <p className="text-[#4A5043]">The ticket listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/home/marketplace"
            className="inline-block px-6 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-[#2C3228] font-medium">
            Browse Other Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex-1">
        {/* Hero Section - Enhanced */}
        <div className="relative h-[300px] sm:h-[500px] bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
          <Image
            src={listing.ticket.image}
            alt={listing.ticket.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Floating Navigation */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <Link
              href="/home/marketplace"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Marketplace
            </Link>
          </div>

          {/* Hero Content - Enhanced */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="px-3 py-1.5 bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] rounded-full text-xs sm:text-sm text-white font-medium flex items-center gap-2 shadow-lg shadow-[#8E2DE2]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] rounded-full text-xs sm:text-sm text-white font-medium flex items-center gap-2 shadow-lg shadow-[#8E2DE2]/20">
                  <span>⌚</span>
                  <span>{listing.ticket.time}</span>
                  <span className="text-white/80">WIB</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-6xl font-bold text-white mb-4 leading-tight">{listing.ticket.name}</h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">{listing.ticket.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">
                    {listing.categoryName} - Seat {listing.seatNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Enhanced */}
        <div className="px-4 sm:px-8 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Seller Card - Enhanced */}
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#3A7BD5] flex items-center justify-center text-xl font-bold text-white">
                      {listing.user.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#2C3228]">{listing.user.name}</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified Seller</span>
                      </div>
                      <p className="text-[#4A5043]">{listing.user.email}</p>
                    </div>
                  </div>
                  {listing.description && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-[#00D2FF]/5 to-[#3A7BD5]/5 rounded-xl">
                      <p className="text-[#4A5043] italic">{listing.description}</p>
                    </div>
                  )}
                </div>

                {/* Event Details Card - Enhanced */}
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-[#2C3228] mb-6 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-[#8E2DE2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Event Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-[#00D2FF]/5 to-[#3A7BD5]/5 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">📅</div>
                      <div>
                        <p className="text-sm text-[#4A5043] mb-1">Date</p>
                        <p className="font-medium text-[#2C3228]">
                          {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-[#00D2FF]/5 to-[#3A7BD5]/5 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">⌚</div>
                      <div>
                        <p className="text-sm text-[#4A5043] mb-1">Time</p>
                        <p className="font-medium text-[#2C3228]">{listing.ticket.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Price Card Enhanced */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4 z-10">
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#00D2FF]/5 to-[#3A7BD5]/5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">💺</div>
                        <div className="flex-1">
                          <p className="text-sm text-[#4A5043]">Category & Seat</p>
                          <p className="font-medium text-[#2C3228]">
                            {listing.categoryName} - Seat {listing.seatNumber}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#D3D9C9]">
                        <p className="text-sm text-[#4A5043] mb-1">Selling Price</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-2xl font-bold text-[#2C3228]">Rp {listing.price.toLocaleString("id-ID")}</p>
                          {listing.ticket.seatCategories.map((category) => {
                            if (category.name === listing.categoryName && listing.price !== category.price) {
                              const discount = Math.round((1 - listing.price / category.price) * 100);
                              const markup = Math.round((listing.price / category.price - 1) * 100);
                              return (
                                <div
                                  key={category.name}
                                  className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-[#4A5043] line-through whitespace-nowrap">Rp {category.price.toLocaleString("id-ID")}</span>
                                  {listing.price < category.price ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">{discount}% OFF</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium whitespace-nowrap">+{markup}%</span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>

                    <BuyTicketButton
                      listingId={listing._id.toString()}
                      isOwner={currentUserId === listing.user._id.toString()}
                    />

                    <div className="p-4 bg-gradient-to-r from-[#00D2FF]/5 to-[#3A7BD5]/5 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-[#4A5043]">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>Secure transaction with buyer protection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add ToastContainer at the end of the component */}
      <ToastContainer />
    </div>
  );
};

export default MarketplaceTicketDetail;
