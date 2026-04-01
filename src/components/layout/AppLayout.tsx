import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Settings } from "../../types";
import { useChatStore } from "../../store/chatStore";
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
  const { id: urlChatId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { chats, activeChatId, setActiveChat, createChat } = useChatStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync URL param ↔ store on every render
  useEffect(() => {
    if (urlChatId) {
      const exists = chats.some((c) => c.id === urlChatId);
      if (!exists) {
        // Chat was deleted or URL is invalid — go home
        navigate("/", { replace: true });
        return;
      }
      if (activeChatId !== urlChatId) {
        setActiveChat(urlChatId);
      }
    } else {
      // Root route "/" — navigate to last active or first chat
      const targetId = activeChatId ?? chats[0]?.id;
      if (targetId && chats.some((c) => c.id === targetId)) {
        navigate(`/chat/${targetId}`, { replace: true });
      }
    }
  }, [urlChatId, chats, activeChatId, navigate, setActiveChat]);

  const handleSelectChat = (id: string) => {
    setIsSidebarOpen(false);
    navigate(`/chat/${id}`);
  };

  const handleNewChat = () => {
    const id = createChat();
    setIsSidebarOpen(false);
    navigate(`/chat/${id}`);
  };

  const handleDeleteChat = (id: string) => {
    const { deleteChat, activeChatId: currentActive } = useChatStore.getState();
    deleteChat(id);
    const { activeChatId: nextActive } = useChatStore.getState();
    if (id === currentActive || id === urlChatId) {
      if (nextActive) {
        navigate(`/chat/${nextActive}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId ?? ""}
        onChatSelect={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="chatArea">
        {activeChatId ? (
          <ChatWindow
            key={activeChatId}
            chatId={activeChatId}
            chatTitle={activeChat?.title ?? "Чат"}
            settings={settingsApi.settings}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <div className="chatAreaEmpty">
            <div className="emptyState">
              <div className="emptyIcon" aria-hidden="true">💬</div>
              <div>
                <div className="emptyStateTitle">Нет активных чатов</div>
                <div>Создайте новый чат, нажав «+» в боковой панели</div>
              </div>
            </div>
          </div>
        )}

        <div className="chatFooter">
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
