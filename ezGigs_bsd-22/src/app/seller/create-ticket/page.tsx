import { verifyToken } from "@/utils/jose";
import CreateTicketForm from "./CreateTicketForm";
import { cookies } from "next/headers";
import { JosePayload } from "@/types";

const SellerCreateTicket = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Please login first.</div>
      </div>
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);

  console.log(payload, "create-ticket");

  const userId = payload.id;

  if (!userId) {
    return (
      <div className="flex-1 p-7 bg-[#FFF8F3]">
        <div className="text-center text-[#FF8008]">Unauthorized access. Please login first.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-7 bg-[#FFF8F3]">
      <h1 className="text-4xl font-black text-[#2D1810] mb-6">Create New Ticket 🎫</h1>
      <CreateTicketForm sellerId={userId} />
    </div>
  );
};

export default SellerCreateTicket;
