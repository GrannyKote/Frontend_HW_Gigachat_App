import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Settings, Scope } from "../../types";
import { useChatStore } from "../../state/chatStore";
import ChatWindow from "../chat/ChatWindow";
import EmptyState from "../chat/EmptyState";
import { BurgerIcon, GearIcon, MoonIcon, SunIcon } from "../ui/icons";

const Sidebar = lazy(() => import("../sidebar/Sidebar"));
const SettingsPanel = lazy(() => import("../settings/SettingsPanel"));

export type AppLayoutProps = {
  onLogout: () => void;
  settingsApi: {
    settings: Settings;
    setSettings: (s: Settings) => void;
    reset: () => Settings;
  };
  auth: { credentials: string; scope: Scope };
};

function SidebarFallback({ isOpen }: { isOpen: boolean }) {
  return <aside className={`sidebar sidebarLoading ${isOpen ? "sidebarOpen" : ""}`} />;
}

function SettingsFallback() {
  return (
    <div className="overlay" role="presentation">
      <div className="drawer drawerLoading" aria-hidden="true" />
    </div>
  );
}

export default function AppLayout({ onLogout, settingsApi, auth }: AppLayoutProps) {
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

  const openChat = useCallback((id: string) => {
    navigate(`/chat/${id}`);
    setIsSidebarOpen(false);
  }, [navigate]);

  const handleNewChat = useCallback(() => {
    const id = createChat();
    navigate(`/chat/${id}`);
    setIsSidebarOpen(false);
  }, [createChat, navigate]);

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteChat(id);
      if (activeChatId === id) {
        navigate("/", { replace: true });
      }
    },
    [activeChatId, deleteChat, navigate],
  );

  const handleRenameChat = useCallback((id: string, title: string) => {
    renameChat(id, title);
  }, [renameChat]);

  const toggleTheme = useCallback(() => {
    const next = settingsApi.settings.theme === "dark" ? "light" : "dark";
    settingsApi.setSettings({ ...settingsApi.settings, theme: next });
  }, [settingsApi]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const activeChat = useMemo(
    () => (activeChatId ? chats.find((c) => c.id === activeChatId) : null),
    [activeChatId, chats],
  );
  const messages = useMemo(
    () => (activeChatId ? (messagesByChat[activeChatId] ?? []) : []),
    [activeChatId, messagesByChat],
  );

  return (
    <div className="shell">
      <Suspense fallback={<SidebarFallback isOpen={isSidebarOpen} />}>
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
          onClose={closeSidebar}
        />
      </Suspense>

      <div className="chatArea">
        {activeChatId ? (
          <ChatWindow
            chatId={activeChatId}
            chatTitle={activeChat?.title ?? "Чат"}
            messages={messages}
            auth={auth}
            settings={settingsApi.settings}
            onOpenSidebar={openSidebar}
            onOpenSettings={openSettings}
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
                  onClick={openSidebar}
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
                  onClick={openSettings}
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
        <Suspense fallback={<SettingsFallback />}>
          <SettingsPanel
            settings={settingsApi.settings}
            onSave={settingsApi.setSettings}
            onReset={settingsApi.reset}
            onClose={closeSettings}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
