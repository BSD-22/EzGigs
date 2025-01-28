import { cookies } from "next/headers";
import Image from "next/image";
import { getUserTickets } from "@/db/models/user";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";

import StartSellingButton from "@/components/StartSellingButton";

const HistoryPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Sales History 📊</h1>
        <p className="text-gray-400 mt-4">Please login to view your sales history.</p>
      </div>
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);
  const tickets = await getUserTickets(payload.email);

  if (!tickets || !tickets.data) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Sales History 📊</h1>
      </div>
    );
  }

  console.log(tickets.data, "tickets.data");

  console.log(tickets.data.soldTickets, "tickets.data.soldTickets");

  return (
    <div className="flex-1 p-7 overflow-auto">
      <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-6">Sales History 📊</h1>

      {!tickets.data?.soldTickets?.length ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#8E2DE2]/10 flex items-center justify-center">
            <span className="text-4xl">📈</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-400">No Sales History Yet</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Start selling your tickets in the marketplace and track your sales history here.</p>
          <StartSellingButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.data.soldTickets.map((soldTicket) => {
            const ticketDetails = tickets.data?.ticketDetails.find((detail) => detail._id.toString() === soldTicket.ticketId.toString());

            const buyerDetails = tickets.data?.buyerDetails.find((buyer) => buyer._id.toString() === soldTicket.toUserId.toString());

            if (!ticketDetails || !buyerDetails) return null;

            return (
              <div
                key={soldTicket.ticketId.toString()}
                className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={ticketDetails.image}
                    alt={ticketDetails.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">Sold</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{ticketDetails.name}</h3>

                  <div className="flex items-center gap-2 mb-4 bg-black/20 p-3 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#00F5A0] flex items-center justify-center text-sm font-bold">{buyerDetails.name[0].toUpperCase()}</div>
                    <div>
                      <p className="text-sm text-white">Sold to {buyerDetails.name}</p>
                      <p className="text-xs text-gray-400">{buyerDetails.email}</p>
                    </div>
                  </div>

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
                      <span>
                        {soldTicket.categoryName} - Seat {soldTicket.seatNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <div>
                        <span className="text-green-500">Sold for Rp {soldTicket.soldPrice?.toLocaleString("id-ID")}</span>
                        {ticketDetails.seatCategories.map((category) => {
                          if (category.name === soldTicket.categoryName) {
                            return (
                              soldTicket.soldPrice !== category.price && (
                                <span
                                  key={category.name}
                                  className="text-xs text-gray-500 block">
                                  Original price: Rp {category.price.toLocaleString("id-ID")}
                                </span>
                              )
                            );
                          }
                          return null;
                        })}
                      </div>
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
};

export default HistoryPage;
