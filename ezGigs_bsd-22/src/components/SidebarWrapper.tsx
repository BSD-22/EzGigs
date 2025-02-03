"use client";

import { useEffect, useState } from "react";
import SideBar from "./SidebarComponent";
import { UserMe } from "@/app/home/marketplace/chat/[sellerId]/page";

const SidebarWrapper = () => {
  const [userData, setUserData] = useState<UserMe | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });
        const json = await response.json();

        if (json.statusCode === 200) {
          setUserData({
            _id: json.data.id,
            role: json.data.role,
            name: json.data.name,
            email: json.data.email,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return <SideBar userData={userData} />;
};

export default SidebarWrapper;
