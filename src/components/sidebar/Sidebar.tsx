import type { Chat, ChatId } from "../../types";
import { PlusIcon, SearchIcon } from "../ui/icons";
import ChatList from "./ChatList";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  chats: Chat[];
  activeChatId: ChatId | null;
  onChatSelect: (id: ChatId) => void;
  onNewChat: () => void;
  onDeleteChat: (id: ChatId) => void;
  onRenameChat: (id: ChatId, title: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  search,
  onSearchChange,
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
}: Props) {
  return (
    <>
      {isOpen ? (
        <div
          className="overlay overlayLeft"
          onClick={onClose}
          role="presentation"
        />
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
          <div className="searchContainer">
            <div className="searchField">
              <div className="searchIconPos" aria-hidden="true">
                <SearchIcon />
              </div>
              <input
                className="searchInput searchInputPadded"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Поиск по чатам"
              />
            </div>
          </div>
        </div>

        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={onChatSelect}
          onDeleteChat={onDeleteChat}
          onRenameChat={onRenameChat}
        />
      </aside>
    </>
  );
}
