import { useMemo, useState } from "react";
import type { ChatId, Message, Settings } from "../../types";
import { mockChats, mockMessagesByChatId } from "../../mockData";
import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import SettingsPanel from "../settings/SettingsPanel";

type Props = {
  onLogout: () => void;
  settingsApi: {
    settings: Settings;
    setSettings: (s: Settings) => void;
    reset: () => Settings;
  };
};

export default function AppLayout({ onLogout, settingsApi }: Props) {
  const [activeChatId, setActiveChatId] = useState<ChatId>(mockChats[0]!.id);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const chats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockChats;
    return mockChats.filter((c) => c.title.toLowerCase().includes(q));
  }, [search]);

  const messages: Message[] = mockMessagesByChatId[activeChatId] ?? [];

  const openChat = (id: ChatId) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="shell">
      <Sidebar
        search={search}
        onSearchChange={setSearch}
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={openChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="chatArea">
        <ChatWindow
          chatTitle={mockChats.find((c) => c.id === activeChatId)?.title ?? "Чат"}
          messages={messages}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <div style={{ padding: 12, borderTop: "1px solid var(--color-border)" }}>
          <button className="btn btnDanger" onClick={onLogout} type="button">
            Выйти
          </button>
        </div>
      </div>

      {isSettingsOpen ? (
        <SettingsPanel
          settings={settingsApi.settings}
          onSave={settingsApi.setSettings}
          onReset={settingsApi.reset}
          onClose={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}

