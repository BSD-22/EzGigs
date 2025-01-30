import { cookies } from "next/headers";
import { decodeToken } from "@/utils/jose";
import { JosePayload } from "@/types";
import { database } from "@/services/firebase";
import { ref, get } from "firebase/database";
import Link from "next/link";

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

const ChatsPage = async () => {
  const cookieStore = await cookies();
  const decodedToken = decodeToken<JosePayload>(cookieStore.get("token")?.value as string);
  const currentUserId = decodedToken?.id;

  const chatsRef = ref(database, "chats");
  const snapshot = await get(chatsRef);
  const chats: Record<string, ChatPreview> = {};

  if (snapshot.exists()) {
    const allChats = snapshot.val() as Record<string, FirebaseChat>;

    Object.entries(allChats).forEach(([chatId, chatData]) => {
      if (chatId.includes(currentUserId) && chatData.participants?.[currentUserId]) {
        const messages = chatData.messages;
        if (messages) {
          const messageArray = Object.values(messages);
          const lastMessage = messageArray[messageArray.length - 1];
          chats[chatId] = {
            lastMessage,
            participants: chatData.participants,
          };
        } else {
          chats[chatId] = {
            participants: chatData.participants,
          };
        }
      }
    });
  }

  const sortedChats = Object.entries(chats).sort(([, a], [, b]) => {
    const timeA = a.lastMessage?.timestamp || 0;
    const timeB = b.lastMessage?.timestamp || 0;
    return timeB - timeA;
  });

  return (
    <div className="flex-1 p-7 overflow-auto">
      <h1 className="text-4xl font-black text-[#2C3228] mb-6">Your Chats 💬</h1>

      {sortedChats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#D3D9C9]">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#4A5043]/10 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2C3228]">No Chat History</h2>
          <p className="text-[#4A5043] mt-2">Start chatting with sellers in the marketplace!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedChats.map(([chatId, chat]) => {
            const otherParticipantId = chatId.split("-").find((id) => id !== currentUserId);
            const otherParticipant = chat.participants[otherParticipantId || ""];

            return (
              <Link
                key={chatId}
                href={`/home/marketplace/chat/${otherParticipantId}`}
                className="block bg-white rounded-2xl overflow-hidden border border-[#D3D9C9] p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#4A5043]/10 flex items-center justify-center text-xl">
                    {otherParticipant?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#2C3228]">{otherParticipant?.name || "Unknown User"}</h3>
                    {chat.lastMessage ? (
                      <p className="text-sm text-[#4A5043] truncate">{chat.lastMessage.text}</p>
                    ) : (
                      <p className="text-sm text-[#4A5043]/70 italic">No messages yet</p>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <div className="text-xs text-[#4A5043]/70">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
