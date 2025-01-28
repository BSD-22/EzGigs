import { cookies } from "next/headers";
import Image from "next/image";
import { getMarketplaceById } from "@/db/models/marketplace";
import BuyTicketButton from "./BuyTicketButton";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";

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
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Listing Not Found 😢</h1>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-2xl overflow-hidden">
          <div className="relative h-96 w-full">
            <Image
              src={listing.ticket.image}
              alt={listing.ticket.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#00F5A0] flex items-center justify-center text-lg font-bold">{listing.user.name[0].toUpperCase()}</div>
              <div>
                <p className="text-white">Sold by {listing.user.name}</p>
                <p className="text-sm text-gray-400">{listing.user.email}</p>
              </div>
            </div>

            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">{listing.ticket.name}</h1>

            {listing.description && <p className="mt-4 text-gray-400 italic">{listing.description}</p>}

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="text-white">{listing.ticket.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white">
                      {new Date(listing.ticket.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⌚</span>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white">{listing.ticket.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💺</span>
                  <div>
                    <p className="text-sm text-gray-400">Seat</p>
                    <p className="text-white">
                      {listing.categoryName} - {listing.seatNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#8E2DE2]/20 pt-8">
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="text-3xl font-bold text-[#00F5A0]">Rp {listing.price.toLocaleString("id-ID")}</p>
                {listing.ticket.seatCategories.map((category) => {
                  if (category.name === listing.categoryName) {
                    return (
                      listing.price !== category.price && (
                        <p
                          key={category.name}
                          className="text-sm text-gray-400 mt-1">
                          <span className="line-through">Rp {category.price.toLocaleString("id-ID")}</span>
                          {listing.price < category.price ? (
                            <span className="ml-2 text-green-500">({Math.round((1 - listing.price / category.price) * 100)}% OFF)</span>
                          ) : (
                            <span className="ml-2 text-yellow-500">({Math.round((listing.price / category.price - 1) * 100)}% MARKUP)</span>
                          )}
                        </p>
                      )
                    );
                  }
                  return null;
                })}
              </div>
              <BuyTicketButton
                listingId={listing._id.toString()}
                isOwner={currentUserId === listing.user._id.toString()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceTicketDetail;
