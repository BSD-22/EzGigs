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
    <div className="flex-1 p-7">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-2xl overflow-hidden">
          <div className="relative h-96 w-full">
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">{ticket.name}</h1>
            <p className="mt-4 text-gray-400">{ticket.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="text-white">{ticket.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white">
                      {new Date(ticket.date).toLocaleDateString("id-ID", {
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
                    <p className="text-white">{ticket.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💺</span>
                  <div>
                    <p className="text-sm text-gray-400">Seat Categories</p>
                    <div className="space-y-1">
                      {ticket.seatCategories.map((category) => (
                        <p
                          key={category.name}
                          className="text-white">
                          {category.name} - Rp {category.price.toLocaleString("id-ID")}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#8E2DE2]/20 pt-8">
              <div>
                <p className="text-sm text-gray-400">Starting from</p>
                <p className="text-2xl font-bold text-[#00F5A0]">Rp {Math.min(...ticket.seatCategories.map((cat) => cat.price)).toLocaleString("id-ID")}</p>
              </div>
              <button className="px-8 py-3 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] rounded-xl text-white font-medium hover:opacity-90 transition-opacity">Buy Ticket</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
