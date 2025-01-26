import Image from "next/image";
import { getTicketById } from "@/db/models/ticket";

const fetchTicketDetail = async (id: string) => {
  const tickets = await getTicketById(id);

  return tickets;
};

const TicketDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await fetchTicketDetail(id);
  const ticket = data.data;

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Ticket not found ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Ini masih pake a tolong dibenerin nanti ya  */}
      <a
        href="/home/ticket"
        className="inline-flex items-center gap-2 text-[#00F5A0] hover:text-[#8E2DE2] transition-colors mb-8">
        <span>←</span> Back to tickets
      </a>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8E2DE2]/20 to-[#00F5A0]/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-500 ease-out" />
            <Image
              src={ticket.image}
              alt={ticket.name}
              fill
              className="object-cover rounded-2xl"
            />
          </div>

          <div className="space-y-6 bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-[#8E2DE2]/20">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">{ticket.name}</h1>

            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-[#8E2DE2]/20 rounded-full text-[#00F5A0] font-semibold">Rp {ticket.price.toLocaleString("id-ID")}</span>
              <span className="px-4 py-2 bg-[#8E2DE2]/20 rounded-full text-white/80">Seat {ticket.seats}</span>
            </div>

            <div className="space-y-4 text-gray-300">
              <p className="text-lg">{ticket.description}</p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#00F5A0]">📍</span>
                  <span>{ticket.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F5A0]">📅</span>
                  <span>
                    {new Date(ticket.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F5A0]">⏰</span>
                  <span>{ticket.time} WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <form
                action="/api/checkout"
                method="POST"
                className="w-full">
                <button className="w-full bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-opacity">Get Your Ticket Now! 🎫</button>
              </form>

              <div className="flex justify-center gap-4">
                <form
                  action="/api/wishlist"
                  method="POST"
                  className="contents">
                  <button className="flex items-center gap-2 text-[#00F5A0] hover:text-white transition-colors">
                    <span>💝</span> Add to Wishlist
                  </button>
                </form>
                <form
                  action="/api/cart"
                  method="POST"
                  className="contents">
                  <button className="flex items-center gap-2 text-[#00F5A0] hover:text-white transition-colors">
                    <span>🛒</span> Add to Cart
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
