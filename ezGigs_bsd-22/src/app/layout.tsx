import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EzGigs",
  description: "All in one placefor all event ticketing online selling & production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SubscriptionProvider>{children}</SubscriptionProvider>
      </body>
    </html>
  );
}
