import { getTicketById } from "@/db/models/ticket";
import Image from "next/image";

const TicketDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await getTicketById(id);
  const ticket = data.data;

  if (!ticket) {
    return (
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Ticket Not Found 😢</h1>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7 bg-gradient-to-b from-[#F4F6F0] to-[#E8EDE1] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Card Container */}
        <div className="bg-[#FAFBF6] rounded-2xl overflow-hidden border border-[#D3D9C9] shadow-xl">
          {/* Hero Section */}
          <div className="relative h-[400px]">
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFBF6] via-black/20 to-transparent" />
            
            {/* Floating Event Info */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="flex justify-between items-end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-[#4A5043] text-white text-sm font-medium rounded-full">
                      Live Event
                    </span>
                    <span className="px-4 py-1 bg-[#656D5D] text-white text-sm font-medium rounded-full">
                      Concert
                    </span>
                  </div>
                  <h1 className="text-6xl font-black text-[#2C3228] tracking-tight">
                    {ticket.name}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-[#4A5043] text-lg">Starting from</p>
                  <p className="text-3xl font-bold text-[#2C3228]">
                    Rp {Math.min(...ticket.seatCategories.map(cat => cat.price)).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-10">
            {/* Event Details Grid */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Date</p>
                    <p className="text-[#2C3228] font-medium">
                      {new Date(ticket.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⌚</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Time</p>
                    <p className="text-[#2C3228] font-medium">{ticket.time} WIB</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#E8EDE1] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#D3D9C9] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="text-[#4A5043]">Venue</p>
                    <p className="text-[#2C3228] font-medium">{ticket.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              {/* Left Column - Description */}
              <div>
                <h3 className="text-xl font-bold text-[#2C3228] mb-4">About This Event</h3>
                <p className="text-[#4A5043] leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Right Column - Ticket Categories */}
              <div>
                <h3 className="text-xl font-bold text-[#2C3228] mb-6">Available Tickets</h3>
                <div className="space-y-4">
                  {ticket.seatCategories.map((category) => (
                    <div 
                      key={category.name}
                      className="group bg-[#E8EDE1] p-6 rounded-xl border border-[#D3D9C9] hover:bg-[#DFE5D6] transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#2C3228] text-lg">{category.name}</p>
                          <p className="text-[#4A5043] text-sm">Limited seats available</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#4A5043]">
                            Rp {category.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-8 w-full py-4 bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#2C3228]/25">
                  Get Your Tickets Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
