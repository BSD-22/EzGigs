import NavigationGuard from "@/components/NavigationGuard";
import SidebarWrapper from "@/components/SidebarWrapper";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1] text-[#2C3228] flex">
        <SidebarWrapper />
        <div className="flex-1">{children}</div>
      </div>
    </NavigationGuard>
  );
}
