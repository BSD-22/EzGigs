import { cookies } from "next/headers";
import Image from "next/image";
import { getUserTickets } from "@/db/models/user";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";
import { ObjectId } from "mongodb";
import { TicketModel } from "@/db/models/ticket";
import { getAllMarketplace } from "@/db/models/marketplace";
import BrowseTicketsButton from "@/components/BrowseTicketsButton";

// Add type at the top with other imports
type TicketWithStatus = {
  ticketId: ObjectId;
  status: "owned" | "selling" | "sold";
  purchasePrice?: number;
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
    <div className="flex-1 p-7 overflow-auto">
      <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-6">My Tickets 🎫</h1>

      {!activeTickets.length ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#8E2DE2]/10 flex items-center justify-center">
            <span className="text-4xl">🎫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-400">No Tickets Found</h2>
          <p className="text-gray-500 mt-2">You haven&apos;t purchased any tickets yet.</p>
          <BrowseTicketsButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTickets.map((ticket: TicketWithStatus) => {
            const ticketDetails = userTickets.ticketDetails?.find((detail: TicketModel) => detail._id.toString() === ticket.ticketId.toString());

            // Find marketplace listing if ticket is being sold
            const marketplaceListing = ticket.status === "selling" ? marketplaceListings?.find((listing) => listing.ticket._id.toString() === ticket.ticketId.toString()) : null;

            if (!ticketDetails) return null;

            return (
              <div
                key={ticket.ticketId.toString()}
                className="block bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-all duration-300">
                <div className="relative h-48 w-full">
                  <Image
                    src={ticketDetails.image}
                    alt={ticketDetails.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === "owned" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{ticketDetails.name}</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{ticketDetails.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {new Date(ticketDetails.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💺</span>
                      <span>Seat {ticketDetails.seats}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      {ticket.status === "selling" && marketplaceListing ? (
                        <div>
                          <span className="text-yellow-500">Listed for Rp {marketplaceListing.price.toLocaleString("id-ID")}</span>
                          <span className="text-xs text-gray-500 block">Original price: Rp {ticketDetails.price.toLocaleString("id-ID")}</span>
                        </div>
                      ) : (
                        <div>
                          <span>Rp {ticket.purchasePrice?.toLocaleString("id-ID") || ticketDetails.price.toLocaleString("id-ID")}</span>
                          {ticket.purchasePrice && ticket.purchasePrice !== ticketDetails.price && (
                            <span className="text-xs text-gray-500 block">Original price: Rp {ticketDetails.price.toLocaleString("id-ID")}</span>
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
  );
}

export default MyTicketsPage;
