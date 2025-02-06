import { cookies } from "next/headers";
import Image from "next/image";
import { getUserTickets } from "@/db/models/user";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";
import { ObjectId } from "mongodb";
import { TicketModel } from "@/db/models/ticket";
import { getAllMarketplace } from "@/db/models/marketplace";
import BrowseTicketsButton from "@/components/BrowseTicketsButton";
import Header from "@/components/Header";

type TicketWithStatus = {
  ticketId: ObjectId;
  status: "owned" | "selling" | "sold";
  purchasePrice?: number;
  categoryName: string;
  seatNumber: string;
};

async function MyTicketsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">My Tickets 🎫</h1>
        <p className="text-gray-400 mt-4">Please login to view your tickets.</p>
      </div>
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);
  const { data: userTickets } = await getUserTickets(payload.email);
  console.log("user ticket >>>>>>>", userTickets);

  const { data: marketplaceListings } = await getAllMarketplace();

  if (!userTickets) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">My Tickets 🎫</h1>
      </div>
    );
  }

  const activeTickets = userTickets.ownedTickets?.filter((ticket: TicketWithStatus) => ticket.status !== "sold") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-4 sm:p-7 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <Header
            title="My Tickets🎫"
            description="View your purchased tickets here"
          />
          {/* <div className="text-sm sm:text-base text-gray-600"> */}

          {/* {activeTickets.length} {activeTickets.length === 1 ? "ticket" : "tickets"} */}
          {/* </div> */}
        </div>

        {!activeTickets.length ? (
          <div className="text-center p-6 sm:p-12 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl animate-pulse">🎫</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">No Tickets Found</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">You haven&apos;t purchased any tickets yet.</p>
            <BrowseTicketsButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeTickets.map((ticket: TicketWithStatus) => {
              const ticketDetails = userTickets.ticketDetails?.find((detail: TicketModel) => detail._id.toString() === ticket.ticketId.toString());
              const marketplaceListing = ticket.status === "selling" ? marketplaceListings?.find((listing) => listing.ticket._id.toString() === ticket.ticketId.toString()) : null;

              if (!ticketDetails) return null;

              return (
                <div
                  key={ticket.ticketId.toString() + Math.floor(Math.random() * 1000)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                    <Image
                      src={ticketDetails.image}
                      alt={ticketDetails.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === "owned" ? "bg-gray-800 text-white" : "bg-white/90 text-gray-800"}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-1">{ticketDetails.name}</h3>
                      <p className="text-white/80 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="line-clamp-1">{ticketDetails.venue}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 text-center">📅</span>
                        <span>
                          {new Date(ticketDetails.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 text-center">💺</span>
                        <span className="font-medium">
                          {ticket.categoryName} - Seat {ticket.seatNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <span className="w-4 text-center">💰</span>
                        {ticket.status === "selling" && marketplaceListing ? (
                          <div>
                            <span className="font-semibold text-gray-800">Rp {marketplaceListing.price.toLocaleString("id-ID")}</span>
                            <span className="text-xs text-gray-500 block">Bought for: Rp {ticket.purchasePrice?.toLocaleString("id-ID")}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-gray-800">Rp {ticket.purchasePrice?.toLocaleString("id-ID")}</span>
                            {ticket.purchasePrice !== ticketDetails.seatCategories.find((cat) => cat.name === ticket.categoryName)?.price && (
                              <span className="text-xs text-gray-500 block">
                                Original: Rp {ticketDetails.seatCategories.find((cat) => cat.name === ticket.categoryName)?.price.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTicketsPage;
