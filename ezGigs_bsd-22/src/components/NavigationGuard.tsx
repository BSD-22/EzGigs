"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const NavigationGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login?error=Please%20Login%20First");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login?error=Please%20Login%20First");
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
};

export default NavigationGuard;
