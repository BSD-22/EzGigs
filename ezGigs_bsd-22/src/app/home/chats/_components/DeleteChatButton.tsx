"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteChatButtonProps {
  chatId: string;
  onDelete: () => void;
}

const DeleteChatButton = ({ chatId, onDelete }: DeleteChatButtonProps) => {
  const router = useRouter();

  const handleDeleteChat = async (chatId: string) => {
    const response = await fetch(`/api/chats/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ chatId }),
    });

    if (response.ok) {
      console.log(`Chat with ID ${chatId} removed from user history.`);
      onDelete();
      router.refresh();
    } else {
      console.error("Failed to delete chat from user history.");
    }
  };

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleDeleteChat(chatId);
  };

  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2 transition-all flex items-center">
      <Trash2 color="red" />
    </button>
  );
};

export default DeleteChatButton;
