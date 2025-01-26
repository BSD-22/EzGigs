import NavigationGuard from "@/components/NavigationGuard";
import Sidebar from "@/components/SidebarComponent";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white flex">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </NavigationGuard>
  );
}
