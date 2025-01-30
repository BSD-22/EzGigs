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
      <h1 className="text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text mb-8">Your Chats 💬</h1>

      <div className="space-y-4">
        {sortedChats.map(([chatId, chat]) => {
          const otherParticipantId = chatId.split("-").find((id) => id !== currentUserId);
          const otherParticipant = chat.participants[otherParticipantId || ""];

          return (
            <Link
              key={chatId}
              href={`/home/marketplace/chat/${otherParticipantId}`}
              className="block bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl p-4 hover:border-[#00F5A0]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#00F5A0] flex items-center justify-center text-xl">{otherParticipant?.name?.[0]?.toUpperCase() || "?"}</div>
                <div className="flex-1">
                  <h3 className="font-bold">{otherParticipant?.name || "Unknown User"}</h3>
                  {chat.lastMessage ? <p className="text-sm text-gray-400 truncate">{chat.lastMessage.text}</p> : <p className="text-sm text-gray-400 italic">No messages yet</p>}
                </div>
                {chat.lastMessage && <div className="text-xs text-gray-500">{new Date(chat.lastMessage.timestamp).toLocaleTimeString()}</div>}
              </div>
            </Link>
          );
        })}

        {sortedChats.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No chat history yet</p>
            <p className="text-sm">Start chatting with sellers in the marketplace!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
