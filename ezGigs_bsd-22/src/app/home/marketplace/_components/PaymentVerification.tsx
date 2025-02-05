"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function PaymentVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams?.get("success");
    const sessionId = searchParams?.get("session_id");
    const purchaseId = searchParams?.get("purchase_id");

    if (success === "true" && sessionId && purchaseId) {
      verifyMarketplacePayment(sessionId, purchaseId);
    }
  }, [searchParams]);

  const verifyMarketplacePayment = async (sessionId: string, purchaseId: string) => {
    try {
      const verifyRes = await fetch("/api/marketplace/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId, purchaseId }),
      });

      let verifyData;
      try {
        verifyData = await verifyRes.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        const textResponse = await verifyRes.text();
        console.error("Raw response:", textResponse);
        toast.error("Server response error");
        return;
      }

      if (!verifyRes.ok) {
        toast.error(verifyData?.message || "Payment verification failed");
        return;
      }

      if (verifyData?.statusCode === 200) {
        toast.success("Payment successful! Your ticket has been confirmed.");
        router.push("/home/ticket");
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Error verifying payment");
    }
  };

  return null;
}
