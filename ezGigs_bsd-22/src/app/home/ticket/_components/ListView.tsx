import Image from "next/image";
import { TicketModel } from "@/db/models/ticket";

interface ListViewProps {
  tickets: TicketModel[];
  handleTicketClick: (ticketId: string) => void;
  handleBuyTicket: (ticketId: string, categoryName: string) => void;
  calculateDiscountedPrice: (price: number) => number;
  userSubscription: "free" | "premium" | "vip";
}

export default function ListView({ tickets, handleTicketClick, handleBuyTicket, calculateDiscountedPrice, userSubscription }: ListViewProps) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket._id.toString()}
          onClick={() => handleTicketClick(ticket._id.toString())}
          className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#D3D9C9] hover:shadow-lg transition-all cursor-pointer">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-[280px] h-[180px] sm:h-auto flex-shrink-0">
              <div className="relative h-full">
                <Image
                  src={ticket.image}
                  alt={ticket.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/50 to-transparent" />
              </div>
              <div className="absolute bottom-3 left-3 bg-white rounded-xl p-2 text-center min-w-[50px]">
                <p className="text-lg font-semibold text-[#2C3228] leading-none">{new Date(ticket.date).getDate()}</p>
                <p className="text-xs font-medium text-[#4A5043] mt-0.5">{new Date(ticket.date).toLocaleDateString("id-ID", { month: "short" })}</p>
              </div>
            </div>

            <div className="flex-1 p-3 sm:p-4">
              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-[#2C3228] text-white px-2 py-1 rounded-full text-xs">
                    <span>🎭</span>
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-medium text-[#2C3228]">Live Sales</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#2C3228] mb-1 line-clamp-2">{ticket.name}</h3>
                <p className="text-[#4A5043] flex items-center gap-1.5 text-sm">
                  <span>📍</span>
                  <span className="line-clamp-1">{ticket.venue}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ticket.seatCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyTicket(ticket._id.toString(), category.name);
                    }}
                    disabled={category.availableSeats <= 0}
                    className={`p-3 rounded-xl text-left transition-all ${category.availableSeats > 0 ? "hover:bg-[#F4F6F0] border border-[#D3D9C9]" : "bg-gray-50 cursor-not-allowed opacity-60"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#2C3228] text-sm truncate">{category.name}</span>
                          {category.availableSeats <= 20 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded-full animate-pulse whitespace-nowrap">{category.availableSeats} left!</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {userSubscription !== "free" && <span className="text-xs text-gray-400 line-through font-normal truncate">Rp {category.price.toLocaleString("id-ID")}</span>}
                          <div className="flex items-baseline gap-0.5 min-w-0">
                            <span className="text-[10px] font-normal text-[#4A5043]">Rp</span>
                            <span className="text-sm font-semibold text-[#2C3228] truncate">{Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`
                                    h-[40px] w-[40px] rounded-lg flex flex-col items-center justify-center flex-shrink-0
                                    ${category.availableSeats <= 20 ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#F4F6F0] text-[#2C3228] border border-[#D3D9C9]"}
                                `}>
                        <span className={`text-sm font-semibold ${category.availableSeats <= 20 ? "text-red-600" : "text-[#2C3228]"}`}>{category.availableSeats}</span>
                        <span className={`text-[8px] font-medium ${category.availableSeats <= 20 ? "text-red-500" : "text-[#4A5043]"}`}>seats</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
