"use client";

import { useEffect, useState } from "react";
import { database } from "@/services/firebase";
import { ref, get } from "firebase/database";
import Link from "next/link";
import DeleteChatButton from "./_components/DeleteChatButton";
import ChatSkeleton from "./_components/ChatSkeleton";

interface FirebaseChat {
  messages?: Record<
    string,
    {
      text: string;
      timestamp: number;
      senderId: string;
      senderName: string;
    }
  >;
  participants: {
    [key: string]: {
      name: string;
      email: string;
    };
  };
}

interface ChatPreview {
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
    senderName: string;
  };
  participants: {
    [key: string]: {
      name: string;
      email: string;
    };
  };
}

const ChatsPage = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, ChatPreview>>({});
  const [loading, setLoading] = useState(true);
  const [, setHiddenChats] = useState<string[]>([]);

  const fetchUserData = async () => {
    try {
      // Fetch user data
      const res = await fetch("/api/user/me", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const json = await res.json();
      const userId = json?.data._id.toString();
      setCurrentUserId(userId);

      const userRes = await fetch(`/api/user/${userId}`, {
        credentials: "include",
      });
      const userData = await userRes.json();
      const hiddenChatsList = userData.data?.hiddenChats || [];
      setHiddenChats(hiddenChatsList);

      const chatsRef = ref(database, "chats");
      const snapshot = await get(chatsRef);

      if (snapshot.exists()) {
        const allChats = snapshot.val() as Record<string, FirebaseChat>;
        const userChats: Record<string, ChatPreview> = {};

        Object.entries(allChats).forEach(([chatId, chatData]) => {
          if (hiddenChatsList.includes(chatId)) return;

          if (chatId.includes(userId) && chatData.participants?.[userId]) {
            const messages = chatData.messages;
            if (messages) {
              const messageArray = Object.values(messages);
              const lastMessage = messageArray[messageArray.length - 1];
              userChats[chatId] = {
                lastMessage,
                participants: chatData.participants,
              };
            } else {
              userChats[chatId] = {
                participants: chatData.participants,
              };
            }
          }
        });

        setChats(userChats);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Update local state immediately
      setHiddenChats((prev) => [...prev, chatId]);
      setChats((prevChats) => {
        const newChats = { ...prevChats };
        delete newChats[chatId];
        return newChats;
      });

      // Call delete API
      const response = await fetch(`/api/chats/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": localStorage.getItem("userEmail") || "",
        },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        console.error("Failed to delete chat");
        // Rollback on failure
        await fetchUserData();
      }
    } catch (error) {
      console.error("Error handling chat deletion:", error);
      // Rollback on error
      await fetchUserData();
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const sortedChats = Object.entries(chats).sort(([, a], [, b]) => {
    const timeA = a.lastMessage?.timestamp || 0;
    const timeB = b.lastMessage?.timestamp || 0;
    return timeB - timeA;
  });

  if (loading) return <ChatSkeleton />;

  return (
    <div className="w-full h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] overflow-hidden fixed inset-0 md:relative z-[60]">
      {/* Header */}
      <div className="w-full flex-none p-3 md:p-4 bg-white border-b border-[#D3D9C9] flex items-center gap-3">
        <Link
          href="/home/marketplace"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-[#2C3228]">Your Chats 💬</h1>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {sortedChats.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl md:rounded-2xl border border-[#D3D9C9]">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-[#4A5043]/10 flex items-center justify-center">
              <span className="text-3xl md:text-4xl">💬</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2C3228]">No Chat History</h2>
            <p className="text-sm md:text-base text-[#4A5043] mt-2">Start chatting with sellers in the marketplace!</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {sortedChats.map(([chatId, chat]) => {
              const otherParticipantId = chatId.split("-").find((id) => id !== currentUserId);
              const otherParticipant = chat.participants[otherParticipantId || ""];

              const participantName = otherParticipant?.name || "Unknown User";

              return (
                <div
                  key={chatId}
                  className="flex justify-between items-center">
                  <Link
                    href={`/home/marketplace/chat/${otherParticipantId}`}
                    className="block bg-white rounded-xl md:rounded-2xl overflow-hidden border border-[#D3D9C9] p-3 md:p-4 hover:shadow-lg transition-all duration-300 flex-1">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#4A5043]/10 flex items-center justify-center text-lg md:text-xl">{participantName[0]?.toUpperCase() || "?"}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2C3228] text-sm md:text-base truncate">{participantName}</h3>
                        {chat.lastMessage ? (
                          <p className="text-xs md:text-sm text-[#4A5043] truncate">{chat.lastMessage.text}</p>
                        ) : (
                          <p className="text-xs md:text-sm text-[#4A5043]/70 italic">No messages yet</p>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-[10px] md:text-xs text-[#4A5043]/70 shrink-0">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      )}
                    </div>
                  </Link>
                  <DeleteChatButton
                    chatId={chatId}
                    onDelete={() => handleDeleteChat(chatId)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
