import Image from "next/image";
import { TicketModel } from "@/db/models/ticket";

interface GridViewProps {
  tickets: TicketModel[];
  handleTicketClick: (ticketId: string) => void;
  handleBuyTicket: (ticketId: string, categoryName: string) => void;
  calculateDiscountedPrice: (price: number) => number;
}

export default function GridView({ tickets, handleTicketClick, handleBuyTicket, calculateDiscountedPrice }: GridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      {tickets.map((ticket) => (
        <div
          key={ticket._id.toString()}
          className="group h-full">
          <div
            onClick={() => handleTicketClick(ticket._id.toString())}
            className="bg-white rounded-lg sm:rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#D3D9C9] h-full">
            <div className="relative">
              <div className="relative h-[100px] sm:h-[180px]">
                <Image
                  src={ticket.image}
                  alt={ticket.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-4">
                <div className="flex items-end justify-between gap-1 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-xl font-bold text-white leading-tight line-clamp-2 mb-0.5 sm:mb-2">{ticket.name}</h3>
                    <div className="flex items-start sm:items-center gap-0.5 sm:gap-2 text-[9px] sm:text-sm text-gray-200">
                      <span className="flex-shrink-0">📍</span>
                      <span className="line-clamp-2 sm:line-clamp-1 break-words">{ticket.venue}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-white rounded-md sm:rounded-xl p-1 sm:p-2 text-center min-w-[35px] sm:min-w-[60px]">
                    <p className="text-sm sm:text-xl font-bold text-[#2C3228] leading-none">{new Date(ticket.date).getDate()}</p>
                    <p className="text-[8px] sm:text-xs font-medium text-[#4A5043] mt-0.5">{new Date(ticket.date).toLocaleDateString("id-ID", { month: "short" })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F6F0] px-1.5 sm:px-4 py-1 sm:py-3 flex items-center justify-between text-[10px] sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-[#2C3228]">Live</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-1 bg-[#2C3228] text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full">
                  <span className="text-[8px] sm:text-xs">🎭</span>
                  <span className="text-[8px] sm:text-sm font-medium">{ticket.time}</span>
                </div>
              </div>
            </div>

            <div className="p-1.5 sm:p-3 grid gap-1 sm:gap-2">
              {ticket.seatCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyTicket(ticket._id.toString(), category.name);
                  }}
                  disabled={category.availableSeats <= 0}
                  className={`w-full p-1.5 sm:p-3 rounded-md sm:rounded-xl text-left transition-all ${
                    category.availableSeats > 0 ? "hover:bg-[#F4F6F0] border border-[#D3D9C9]" : "bg-gray-50 cursor-not-allowed opacity-60"
                  }`}>
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                        <span className="font-medium text-[#2C3228] text-[10px] sm:text-sm truncate">{category.name}</span>
                        {category.availableSeats <= 20 && (
                          <span className="px-1 py-0.5 text-[8px] sm:text-[10px] font-medium bg-red-100 text-red-600 rounded-full animate-pulse whitespace-nowrap">{category.availableSeats}</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <div className="flex items-baseline gap-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[10px] font-normal text-[#4A5043]">Rp</span>
                          <span className="text-[10px] sm:text-sm font-semibold text-[#2C3228] truncate">{Math.round(calculateDiscountedPrice(category.price)).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`
                    h-[25px] w-[25px] sm:h-[40px] sm:w-[40px] rounded-md sm:rounded-lg flex flex-col items-center justify-center flex-shrink-0
                    ${category.availableSeats <= 20 ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#F4F6F0] text-[#2C3228] border border-[#D3D9C9]"}
                  `}>
                      <span className={`text-[10px] sm:text-sm font-semibold ${category.availableSeats <= 20 ? "text-red-600" : "text-[#2C3228]"}`}>{category.availableSeats}</span>
                      <span className={`text-[6px] sm:text-[8px] font-medium ${category.availableSeats <= 20 ? "text-red-500" : "text-[#4A5043]"}`}>seats</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
