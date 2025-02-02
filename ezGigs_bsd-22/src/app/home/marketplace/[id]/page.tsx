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
    <div className="flex-1 p-7 overflow-auto bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden border border-[#D3D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="relative h-[400px] w-full bg-[#2C3228]">
            <Image
              src={listing.ticket.image}
              alt={listing.ticket.name}
              fill
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C3228] via-transparent to-transparent" />
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#F4F6F0] flex items-center justify-center text-lg font-bold text-[#4A5043]">
                {listing.user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[#2C3228] font-medium">Sold by {listing.user.name}</p>
                <p className="text-sm text-[#4A5043]">{listing.user.email}</p>
              </div>
            </div>

            <h1 className="text-4xl font-black text-[#2C3228]">{listing.ticket.name}</h1>

            {listing.description && <p className="mt-4 text-[#4A5043] italic">{listing.description}</p>}

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F0] flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-[#4A5043]">Venue</p>
                    <p className="font-medium text-[#2C3228]">{listing.ticket.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F0] flex items-center justify-center text-xl">
                    📅
                  </div>
                  <div>
                    <p className="text-sm text-[#4A5043]">Date</p>
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F0] flex items-center justify-center text-xl">
                    ⌚
                  </div>
                  <div>
                    <p className="text-sm text-[#4A5043]">Time</p>
                    <p className="font-medium text-[#2C3228]">{listing.ticket.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F0] flex items-center justify-center text-xl">
                    💺
                  </div>
                  <div>
                    <p className="text-sm text-[#4A5043]">Seat</p>
                    <p className="font-medium text-[#2C3228]">
                      {listing.categoryName} - {listing.seatNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#D3D9C9] pt-8">
              <div>
                <p className="text-sm text-[#4A5043]">Price</p>
                <p className="text-3xl font-bold text-[#2C3228]">
                  Rp {listing.price.toLocaleString("id-ID")}
                </p>
                {listing.ticket.seatCategories.map((category) => {
                  if (category.name === listing.categoryName) {
                    return (
                      listing.price !== category.price && (
                        <p
                          key={category.name}
                          className="text-sm mt-1">
                          <span className="text-[#4A5043]/60 line-through">
                            Rp {category.price.toLocaleString("id-ID")}
                          </span>
                          {listing.price < category.price ? (
                            <span className="ml-2 text-green-600">
                              ({Math.round((1 - listing.price / category.price) * 100)}% OFF)
                            </span>
                          ) : (
                            <span className="ml-2 text-amber-600">
                              (+{Math.round((listing.price / category.price - 1) * 100)}%)
                            </span>
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
