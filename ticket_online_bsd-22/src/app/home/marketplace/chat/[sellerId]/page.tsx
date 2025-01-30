"use client";

import { useEffect, useState, useRef, use } from "react";
import { database } from "@/services/firebase";
import { ref, push, onValue, off, set, get } from "firebase/database";
import { ObjectId } from "mongodb";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  senderName: string;
}

export interface UserMe {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
}

interface FirebaseMessage {
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export default function Chat({ params }: { params: Promise<{ sellerId: string }> }) {
  const router = useRouter();
  const { sellerId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUser(data.data);

        if (data.data._id.toString() === sellerId) {
          router.replace("/home/marketplace");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.replace("/home/marketplace");
      }
    };
    fetchCurrentUser();
  }, [sellerId, router]);

  useEffect(() => {
    if (!currentUser || isLoading) return;

    const chatId = [sellerId, currentUser._id.toString()].sort().join("-");
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const participantsRef = ref(database, `chats/${chatId}/participants`);

    const setupParticipants = async () => {
      const snapshot = await get(participantsRef);
      if (!snapshot.exists()) {
        try {
          const res = await fetch(`/api/user/${sellerId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const sellerData = await res.json();

          await set(participantsRef, {
            [currentUser._id.toString()]: {
              name: currentUser.name,
              email: currentUser.email,
            },
            [sellerId]: {
              name: sellerData?.data?.name || "Seller",
              email: sellerData?.data?.email || "pending",
            },
          });
        } catch (error) {
          console.error("Failed to fetch seller data:", error);
        }
      }
    };

    setupParticipants();

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as FirebaseMessage),
        }));
        setMessages(messageList);
        scrollToBottom();
      }
    });

    return () => {
      off(messagesRef);
    };
  }, [sellerId, currentUser, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const chatId = [sellerId, currentUser._id.toString()].sort().join("-");
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    await push(messagesRef, {
      text: newMessage,
      senderId: currentUser._id.toString(),
      senderName: currentUser.name,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0A0A0A]">
      <div className="p-4 bg-black/40 border-b border-[#8E2DE2]/20">
        <h1 className="text-xl font-bold text-white">Chat Room</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUser?._id.toString() ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${message.senderId === currentUser?._id.toString() ? "bg-[#8E2DE2] text-white" : "bg-[#1A1A1A] text-white"}`}>
              <p className="text-sm opacity-75 mb-1">{message.senderName}</p>
              <p>{message.text}</p>
              <p className="text-xs opacity-50 text-right mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-black/40 border-t border-[#8E2DE2]/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#1A1A1A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8E2DE2]"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
