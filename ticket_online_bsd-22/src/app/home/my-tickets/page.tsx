import { cookies } from "next/headers";
import Image from "next/image";
import { getUserTickets } from "@/db/models/user";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";

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
  const tickets = await getUserTickets(payload.email);

  const transformedTickets = {
    ...tickets.data,
    ownedTickets: tickets.data?.ownedTickets?.map((ticket) => ({
      ...ticket,
      ticketDetails: tickets.data?.ticketDetails?.find((detail) => detail._id.toString() === ticket.ticketId.toString()),
    })),
  };

  console.log(transformedTickets.ticketDetails);

  return (
    <div className="flex-1 p-7 overflow-auto">
      <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-6">My Tickets 🎫</h1>

      {!transformedTickets?.ownedTickets?.length ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-400">No Tickets Found</h2>
          <p className="text-gray-500 mt-2">You haven&apos;t purchased any tickets yet.</p>
          <a
            href="/home/ticket"
            className="inline-block mt-4 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Browse Tickets
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedTickets.ownedTickets.map((ticket) => (
            <a
              href={`/home/ticket/${ticket.ticketId.toString()}`}
              key={ticket.ticketId.toString()}
              className="block bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-all duration-300 cursor-pointer">
              <div className="relative h-48 w-full">
                <Image
                  src={ticket.ticketDetails!.image!}
                  alt={ticket.ticketDetails!.name!}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "owned" ? "bg-green-500/20 text-green-500" : ticket.status === "selling" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                    }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">{ticket.ticketDetails!.name}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{ticket.ticketDetails!.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      {new Date(ticket.ticketDetails!.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💺</span>
                    <span>Seat {ticket.ticketDetails!.seats}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>Rp {ticket.ticketDetails!.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTicketsPage;
