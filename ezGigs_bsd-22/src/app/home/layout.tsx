"use client";

import NavigationGuard from "@/components/NavigationGuard";
import SidebarWrapper from "@/components/SidebarWrapper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserMe = async () => {
    try {
      const response = await fetch("/api/user/me", {
        credentials: "include",
      });

      if (response.ok) {
        const json = await response.json();
        if (json.statusCode === 200) {
          setIsAuthenticated(true);
        } else {
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2C3228]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle the redirect
  }

  return (
    <NavigationGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1] text-[#2C3228] flex">
        <SidebarWrapper />
        <div className="flex-1">{children}</div>
      </div>
    </NavigationGuard>
  );
}
