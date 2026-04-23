import type { Chat, ChatId } from "../../types";
import { PlusIcon, SearchIcon } from "../ui/icons";
import ChatList from "./ChatList";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  chats: Chat[];
  activeChatId: ChatId;
  onChatSelect: (id: ChatId) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  search,
  onSearchChange,
  chats,
  activeChatId,
  onChatSelect,
  isOpen,
  onClose,
}: Props) {
  return (
    <>
      {isOpen ? (
        <div className="overlay overlayStart" onClick={onClose} role="presentation" />
      ) : null}
      <aside className={`sidebar ${isOpen ? "sidebarOpen" : ""}`}>
        <div className="sidebarHeader">
          <button className="btn btnIcon" type="button" title="Новый чат">
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
        />
      </aside>
    </>
  );
}

