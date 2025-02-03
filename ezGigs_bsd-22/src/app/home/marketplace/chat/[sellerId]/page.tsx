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
      <div className="flex-1 p-7">
        <h1 className="text-4xl font-black text-[#2C3228] mb-6">Chat Room 💬</h1>
        <div className="text-center py-12 bg-white rounded-2xl border border-[#D3D9C9]">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#4A5043]/10 flex items-center justify-center">
            <span className="text-2xl">⌛</span>
          </div>
          <p className="text-[#4A5043]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex w-full h-full">
        <div className="w-full h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] overflow-hidden fixed inset-0 md:relative z-[60]">
            {/* Header */}
            <div className="w-full flex-none p-3 md:p-4 bg-white border-b border-[#D3D9C9] flex items-center gap-3">
                <button 
                    onClick={() => router.back()} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-[#2C3228]">Chat Room 💬</h1>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?._id.toString() ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] break-words rounded-xl p-2.5 md:p-3 ${
                                message.senderId === currentUser?._id.toString() 
                                    ? "bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white" 
                                    : "bg-white text-[#2C3228] border border-[#D3D9C9]"
                            }`}
                        >
                            <p className="text-xs font-medium mb-1">{message.senderName}</p>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <div className="flex justify-end">
                                <p className="text-[10px] mt-1.5 opacity-70">
                                    {new Date(message.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="w-full flex-none bg-white border-t border-[#D3D9C9] p-3 md:p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-white border border-[#D3D9C9] text-[#2C3228] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5043]/20"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    </main>
  );
}
