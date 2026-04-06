import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Settings, Scope } from "../../types";
import { useChatStore } from "../../state/chatStore";
import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import SettingsPanel from "../settings/SettingsPanel";
import EmptyState from "../chat/EmptyState";
import { BurgerIcon, GearIcon, MoonIcon, SunIcon } from "../ui/icons";

type Props = {
  onLogout: () => void;
  settingsApi: {
    settings: Settings;
    setSettings: (s: Settings) => void;
    reset: () => Settings;
  };
  auth: { credentials: string; scope: Scope };
};

export default function AppLayout({ onLogout, settingsApi, auth }: Props) {
  const { id: chatIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const chats = useChatStore((s) => s.chats);
  const messagesByChat = useChatStore((s) => s.messagesByChat);
  const createChat = useChatStore((s) => s.createChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const renameChat = useChatStore((s) => s.renameChat);

  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeChatId = useMemo(() => {
    if (chatIdParam && chats.some((c) => c.id === chatIdParam)) {
      return chatIdParam;
    }
    return null;
  }, [chatIdParam, chats]);

  useEffect(() => {
    if (chatIdParam && !chats.some((c) => c.id === chatIdParam)) {
      navigate("/", { replace: true });
    }
  }, [chatIdParam, chats, navigate]);

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      const msgs = messagesByChat[c.id] ?? [];
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg ? lastMsg.text.toLowerCase().includes(q) : false;
    });
  }, [search, chats, messagesByChat]);

  const openChat = (id: string) => {
    navigate(`/chat/${id}`);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const id = createChat();
    navigate(`/chat/${id}`);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    if (activeChatId === id) {
      navigate("/", { replace: true });
    }
  };

  const handleRenameChat = (id: string, title: string) => {
    renameChat(id, title);
  };

  const toggleTheme = () => {
    const next = settingsApi.settings.theme === "dark" ? "light" : "dark";
    settingsApi.setSettings({ ...settingsApi.settings, theme: next });
  };

  const activeChat = activeChatId
    ? chats.find((c) => c.id === activeChatId)
    : null;
  const messages = activeChatId
    ? (messagesByChat[activeChatId] ?? [])
    : [];

  return (
    <div className="shell">
      <Sidebar
        search={search}
        onSearchChange={setSearch}
        chats={filteredChats}
        activeChatId={activeChatId}
        onChatSelect={openChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="chatArea">
        {activeChatId ? (
          <ChatWindow
            chatId={activeChatId}
            chatTitle={activeChat?.title ?? "Чат"}
            messages={messages}
            auth={auth}
            settings={settingsApi.settings}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            theme={settingsApi.settings.theme}
            onToggleTheme={toggleTheme}
          />
        ) : (
          <>
            <div className="topbar">
              <div className="topbarTitle">
                <button
                  className="btn btnIcon burgerOnly"
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Открыть меню"
                >
                  <BurgerIcon />
                </button>
                <h2>GigaChat</h2>
              </div>
              <div className="topbarActions">
                <button
                  className="btn btnIcon"
                  type="button"
                  onClick={toggleTheme}
                  title={
                    settingsApi.settings.theme === "dark"
                      ? "Светлая тема"
                      : "Тёмная тема"
                  }
                >
                  {settingsApi.settings.theme === "dark" ? (
                    <SunIcon />
                  ) : (
                    <MoonIcon />
                  )}
                </button>
                <button
                  className="btn btnIcon"
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Настройки"
                >
                  <GearIcon />
                </button>
              </div>
            </div>
            <div className="messages">
              <EmptyState onNewChat={handleNewChat} />
            </div>
          </>
        )}

        <div className="logoutBar">
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
