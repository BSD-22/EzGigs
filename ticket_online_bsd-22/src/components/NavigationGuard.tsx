import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const NavigationGuard = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token || token.value.length <= 0) return redirect("/login?error=Please%20Login%20First");

  return <>{children}</>;
};

export default NavigationGuard;
