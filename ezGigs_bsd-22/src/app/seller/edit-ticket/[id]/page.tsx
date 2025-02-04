import { verifyToken } from "@/utils/jose";
import EditTicketForm from "./EditTicketForm";
import { cookies } from "next/headers";
import { JosePayload } from "@/types";
import { getTicketById, SerializedTicket } from "@/db/models/ticket";
import { SeatCategory } from "@/db/models/ticket";

const EditTicketPage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Silakan login terlebih dahulu.</div>
      </div>
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);
  const userId = payload.id;

  if (!userId) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Silakan login terlebih dahulu.</div>
      </div>
    );
  }

  const ticketData = await getTicketById(params.id);

  if (ticketData.statusCode === 404) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Tiket tidak ditemukan.</div>
      </div>
    );
  }

  if (!ticketData.data) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Data tiket tidak valid.</div>
      </div>
    );
  }

  const serializedTicketData: SerializedTicket = {
    ...ticketData.data,
    _id: ticketData.data._id.toString(),
    sellerId: ticketData.data.sellerId?.toString(),
  };

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3]">
      <h1 className="text-4xl font-black text-[#2D1810] mb-6">Edit Ticket 🎫</h1>
      <EditTicketForm sellerId={userId} initialData={serializedTicketData} />
    </div>
  );
};

export default EditTicketPage;
