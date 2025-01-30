"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { baseUrl } from "@/constants/baseUrl";

type SubscriptionType = "free" | "premium" | "vip";

interface SubscriptionContextType {
  subscription: SubscriptionType;
  updateSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: "free",
  updateSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionType>("free");

  const updateSubscription = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/user/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data) {
        setSubscription(data.data.subscriptionType);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };

  useEffect(() => {
    updateSubscription();
  }, []);

  return <SubscriptionContext.Provider value={{ subscription, updateSubscription }}>{children}</SubscriptionContext.Provider>;
}
