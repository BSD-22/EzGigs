import { verifyToken } from "@/utils/jose";
<<<<<<< HEAD
import EditTicketForm from "./EditTicketForm";
import { cookies } from "next/headers";
import { JosePayload } from "@/types";
import { getTicketById, SerializedTicket } from "@/db/models/ticket";
import { SeatCategory } from "@/db/models/ticket";

const EditTicketPage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
=======
import { cookies } from "next/headers";
import { JosePayload } from "@/types";
import { getTicketById, SerializedTicket } from "@/db/models/ticket";
import EditTicketForm from "../_components/EditTicketForm";

const EditTicketPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const { id } = await params;
>>>>>>> 7af70ebe0e4529d2cdddd212b90a70907cad8aeb

  if (!token) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Silakan login terlebih dahulu.</div>
      </div>
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);
  const userId = payload.id;

<<<<<<< HEAD
  if (!userId) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Silakan login terlebih dahulu.</div>
      </div>
    );
  }

  const ticketData = await getTicketById(params.id);

  if (ticketData.statusCode === 404) {
=======
  const ticketData = await getTicketById(id);

  if (ticketData.statusCode === 404 || !ticketData.data) {
>>>>>>> 7af70ebe0e4529d2cdddd212b90a70907cad8aeb
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Tiket tidak ditemukan.</div>
      </div>
    );
  }

<<<<<<< HEAD
  if (!ticketData.data) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Data tiket tidak valid.</div>
      </div>
    );
  }

=======
>>>>>>> 7af70ebe0e4529d2cdddd212b90a70907cad8aeb
  const serializedTicketData: SerializedTicket = {
    ...ticketData.data,
    _id: ticketData.data._id.toString(),
    sellerId: ticketData.data.sellerId?.toString(),
  };

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3]">
      <h1 className="text-4xl font-black text-[#2D1810] mb-6">Edit Ticket 🎫</h1>
<<<<<<< HEAD
      <EditTicketForm sellerId={userId} initialData={serializedTicketData} />
    </div>
  );
};

=======
      <EditTicketForm
        sellerId={userId}
        initialData={serializedTicketData}
      />
    </div>
  );
};
>>>>>>> 7af70ebe0e4529d2cdddd212b90a70907cad8aeb
export default EditTicketPage;
