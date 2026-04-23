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
        <div
          className="overlay"
          onClick={onClose}
          role="presentation"
          style={{ justifyContent: "flex-start" }}
        />
      ) : null}
      <aside className={`sidebar ${isOpen ? "sidebarOpen" : ""}`}>
        <div className="sidebarHeader">
          <button className="btn btnIcon" type="button" title="Новый чат">
            <PlusIcon />
          </button>
          <div style={{ flex: 1, display: "flex", gap: 10, minWidth: 0 }}>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              >
                <SearchIcon />
              </div>
              <input
                className="searchInput"
                style={{ paddingLeft: 38 }}
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

