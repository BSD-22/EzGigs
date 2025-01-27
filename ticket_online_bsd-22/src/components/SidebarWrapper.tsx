import { cookies } from "next/headers";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";
import SideBar from "./SidebarComponent";

const SidebarWrapper = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  let userData = null;

  if (token) {
    userData = await verifyToken<JosePayload>(token.value);
  }

  return <SideBar userData={userData} />;
};

export default SidebarWrapper;
