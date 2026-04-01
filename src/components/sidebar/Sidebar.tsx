import { useState } from "react";
import type { Chat, ChatId } from "../../types";
import { useChatStore } from "../../store/chatStore";
import { PlusIcon, SearchIcon } from "../ui/icons";
import ChatList from "./ChatList";
import DeleteConfirmModal from "./DeleteConfirmModal";

type Props = {
  chats: Chat[];
  activeChatId: ChatId;
  onChatSelect: (id: ChatId) => void;
  onNewChat: () => void;
  onDeleteChat: (id: ChatId) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}: Props) {
  const { messages, renameChat } = useChatStore();
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<ChatId | null>(null);

  const filtered = search.trim()
    ? chats.filter((c) => {
        const q = search.trim().toLowerCase();
        if (c.title.toLowerCase().includes(q)) return true;
        // Also search the last message of this chat
        const chatMessages = messages[c.id] ?? [];
        const lastMsg = chatMessages[chatMessages.length - 1];
        return lastMsg?.text.toLowerCase().includes(q) ?? false;
      })
    : chats;

  const deleteTarget = deleteTargetId ? chats.find((c) => c.id === deleteTargetId) : null;

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      onDeleteChat(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="overlay overlayStart" onClick={onClose} role="presentation" />
      ) : null}

      <aside className={`sidebar ${isOpen ? "sidebarOpen" : ""}`}>
        <div className="sidebarHeader">
          <button
            className="btn btnIcon"
            type="button"
            title="Новый чат"
            onClick={onNewChat}
          >
            <PlusIcon />
          </button>
          <div className="sidebarSearchWrap">
            <div className="searchBox">
              <div className="searchIcon" aria-hidden="true">
                <SearchIcon />
              </div>
              <input
                className="searchInput"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по чатам"
              />
            </div>
          </div>
        </div>

        <ChatList
          chats={filtered}
          activeChatId={activeChatId}
          onChatSelect={onChatSelect}
          onRenameChat={renameChat}
          onDeleteChat={(id) => setDeleteTargetId(id)}
        />
      </aside>

      {deleteTarget ? (
        <DeleteConfirmModal
          chatTitle={deleteTarget.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      ) : null}
    </>
  );
}
