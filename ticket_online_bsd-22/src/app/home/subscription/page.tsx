"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import { toast } from "react-hot-toast";

const SubscriptionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<"free" | "premium" | "vip">("free");

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  useEffect(() => {
    if (success && sessionId) {
      verifySubscription(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, sessionId]);

  const fetchUserSubscription = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/user/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data) {
        setCurrentSubscription(data.data.subscriptionType);
      }
    } catch (error) {
      console.error("Failed to fetch user subscription:", error);
    }
  };

  const verifySubscription = async (sessionId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/subscription/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (data.statusCode === 200) {
        toast.success("Subscription updated successfully!");
        await fetchUserSubscription();
        router.replace("/home/subscription?status=success");
      } else {
        toast.error("Failed to verify subscription");
      }
    } catch (error) {
      console.error("Failed to verify subscription:", error);
      toast.error("Failed to verify subscription");
    }
  };

  const handleSubscribe = async (planName: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/subscription/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ planName }),
      });

      const data = await res.json();

      if (data.statusCode === 200 && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error("Failed to create subscription");
      }
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast.error("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const subscriptionPlans = [
    {
      name: "Bronze",
      price: "Free",
      description: "Standard package without discount",
      discount: "0%",
      features: ["Ticket purchase access", "Latest concert notifications", "24/7 Customer support"],
      color: "from-[#CD7F32] to-[#B87333]",
    },
    {
      name: "Silver",
      price: "Rp 149.999",
      description: "5% discount on every ticket purchase",
      discount: "5%",
      features: ["All Bronze features", "5% discount on purchases", "Pre-sale ticket access"],
      color: "from-[#C0C0C0] to-[#A8A8A8]",
    },
    {
      name: "Gold",
      price: "Rp 249.999",
      description: "8% discount on every ticket purchase",
      discount: "8%",
      features: ["All Silver features", "8% discount on purchases", "Priority customer support"],
      color: "from-[#FFD700] to-[#DAA520]",
    },
  ];

  const isButtonDisabled = (planName: string) => {
    if (loading) return true;
    if (planName === "Bronze") return true;

    const subscriptionRank = {
      free: 0,
      premium: 1,
      vip: 2,
    };

    const planRank = {
      Bronze: 0,
      Silver: 1,
      Gold: 2,
    };

    return subscriptionRank[currentSubscription] >= planRank[planName as keyof typeof planRank];
  };

  const getButtonText = (planName: string) => {
    if (loading) return "Processing...";

    const subscriptionMap = {
      Bronze: "free",
      Silver: "premium",
      Gold: "vip",
    };

    if (subscriptionMap[planName as keyof typeof subscriptionMap] === currentSubscription) {
      return "Current Plan";
    }

    if (isButtonDisabled(planName)) {
      return "Already Subscribed";
    }

    return "Select Plan";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D3D9C9] rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-[#4A5043] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#656D5D] rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-[#2C3228] mb-4">Choose Your Subscription Plan</h1>
          <p className="text-[#4A5043] text-lg">Get special benefits for every concert ticket purchase</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="opacity-90">{plan.description}</p>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-black">{plan.discount}</span>
                    <span className="ml-2">Discount</span>
                  </div>
                  <div className="text-xl font-bold">{plan.price}</div>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-[#4A5043]">
                      <svg
                        className="w-5 h-5 mr-3 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isButtonDisabled(plan.name)}
                  className={`w-full mt-8 py-4 bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#2C3228]/25 flex items-center justify-center group
                    ${loading || isButtonDisabled(plan.name) ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}>
                  <span>{getButtonText(plan.name)}</span>
                  {!loading && !isButtonDisabled(plan.name) && (
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
