import { useEffect, useRef, useState } from "react";
import type { Message as MessageT, Settings, Scope } from "../../types";
import { useChatStore } from "../../state/chatStore";
import {
  getAccessToken,
  sendChatCompletion,
  sendChatCompletionSync,
} from "../../services/gigachat";
import { BurgerIcon, GearIcon, MoonIcon, SunIcon } from "../ui/icons";
import MessageList from "./MessageList";
import InputArea from "./InputArea";

type Props = {
  chatId: string;
  chatTitle: string;
  messages: MessageT[];
  auth: { credentials: string; scope: Scope };
  settings: Settings;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function ChatWindow({
  chatId,
  chatTitle,
  messages,
  auth,
  settings,
  onOpenSidebar,
  onOpenSettings,
  theme,
  onToggleTheme,
}: Props) {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const renameChat = useChatStore((s) => s.renameChat);

  const canSend = draft.trim().length > 0 && !isLoading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setIsLoading(false);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [chatId]);

  const onSend = async () => {
    if (!canSend) return;

    const userText = draft.trim();
    setDraft("");

    const userMessage: MessageT = {
      id: crypto.randomUUID(),
      role: "user",
      authorLabel: "Вы",
      text: userText,
      createdAt: new Date().toISOString(),
    };
    addMessage(chatId, userMessage);

    const state = useChatStore.getState();
    const chat = state.chats.find((c) => c.id === chatId);
    const allMessages = state.messagesByChat[chatId] ?? [];
    const userMessages = allMessages.filter((m) => m.role === "user");

    if (chat?.title === "Новый чат" && userMessages.length === 1) {
      if (userText.trim().length >= 3) {
        const title =
          userText.length > 35 ? userText.slice(0, 35) + "…" : userText;
        renameChat(chatId, title);
      }
    }

    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    addMessage(chatId, {
      id: assistantId,
      role: "assistant",
      authorLabel: "GigaChat",
      text: "",
      createdAt: new Date().toISOString(),
    });

    const apiMessages = [
      { role: "system", content: settings.systemPrompt },
      ...allMessages.map((m) => ({ role: m.role, content: m.text })),
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = await getAccessToken(auth.credentials, auth.scope);
      let accumulated = "";
      let streamFailed = false;

      try {
        await sendChatCompletion(
          token,
          apiMessages,
          settings,
          (chunk) => {
            accumulated += chunk;
            updateMessage(chatId, assistantId, accumulated);
          },
          controller.signal,
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        streamFailed = true;
      }

      if (streamFailed) {
        try {
          const text = await sendChatCompletionSync(
            token,
            apiMessages,
            settings,
            controller.signal,
          );
          updateMessage(chatId, assistantId, text);
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return;
          const msg =
            err instanceof Error ? err.message : "Неизвестная ошибка";
          updateMessage(chatId, assistantId, `Ошибка: ${msg}`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
      updateMessage(chatId, assistantId, `Ошибка: ${msg}`);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const onStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbarTitle">
          <button
            className="btn btnIcon burgerOnly"
            type="button"
            onClick={onOpenSidebar}
            title="Открыть меню"
          >
            <BurgerIcon />
          </button>
          <h2 title={chatTitle}>{chatTitle}</h2>
        </div>

        <div className="topbarActions">
          <button
            className="btn btnIcon"
            type="button"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="btn btnIcon"
            type="button"
            onClick={onOpenSettings}
            title="Настройки"
          >
            <GearIcon />
          </button>
        </div>
      </div>

      <div className="messages">
        <MessageList messages={messages} isTypingVisible={isLoading} />
        <div ref={bottomRef} />
      </div>

      <div className="inputArea">
        <InputArea
          value={draft}
          onChange={setDraft}
          onSend={onSend}
          onStop={onStop}
          canSend={canSend}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
