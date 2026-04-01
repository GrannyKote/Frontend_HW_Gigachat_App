import { useEffect, useRef } from "react";
import type { Settings } from "../../types";
import { useChatStore } from "../../store/chatStore";
import { sendMessage } from "../../api/gigachat";
import { BurgerIcon, GearIcon } from "../ui/icons";
import MessageList from "./MessageList";
import InputArea from "./InputArea";

type Props = {
  chatId: string;
  chatTitle: string;
  settings: Settings;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
};

export default function ChatWindow({
  chatId,
  chatTitle,
  settings,
  onOpenSidebar,
  onOpenSettings,
}: Props) {
  const {
    messages: allMessages,
    isLoading,
    error,
    addMessage,
    appendToMessage,
    updateMessage,
    setLoading,
    setError,
    updateChatTitleFromFirstMessage,
  } = useChatStore();

  const messages = allMessages[chatId] ?? [];
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      authorLabel: "Вы",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    addMessage(chatId, userMsg);

    // Auto-title from first user message
    const currentMessages = useChatStore.getState().messages[chatId] ?? [];
    if (currentMessages.filter((m) => m.role === "user").length === 1) {
      updateChatTitleFromFirstMessage(chatId, text.trim());
    }

    // Create placeholder for assistant response
    const assistantId = crypto.randomUUID();
    const assistantMsg = {
      id: assistantId,
      role: "assistant" as const,
      authorLabel: settings.model,
      text: "",
      createdAt: new Date().toISOString(),
    };
    addMessage(chatId, assistantMsg);
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      // Build messages array: all messages up to (but not including) the empty assistant placeholder
      const storeMessages = useChatStore.getState().messages[chatId] ?? [];
      const contextMessages = storeMessages.filter(
        (m) => !(m.id === assistantId && m.text === ""),
      );

      await sendMessage(
        contextMessages,
        settings,
        (chunk) => {
          appendToMessage(chatId, assistantId, chunk);
        },
        abortRef.current.signal,
      );

      // Persist final message text
      const finalText =
        useChatStore.getState().messages[chatId]?.find((m) => m.id === assistantId)?.text ?? "";
      updateMessage(chatId, assistantId, finalText);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User stopped generation — keep partial text
        const partialText =
          useChatStore.getState().messages[chatId]?.find((m) => m.id === assistantId)?.text ?? "";
        if (!partialText) {
          // Remove empty placeholder
          const msgs = useChatStore.getState().messages[chatId]?.filter(
            (m) => m.id !== assistantId,
          ) ?? [];
          useChatStore.setState((s) => ({
            messages: { ...s.messages, [chatId]: msgs },
          }));
        } else {
          updateMessage(chatId, assistantId, partialText);
        }
      } else {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка";
        setError(message);
        // Remove empty assistant placeholder on error
        const msgs =
          useChatStore.getState().messages[chatId]?.filter((m) => m.id !== assistantId) ?? [];
        useChatStore.setState((s) => ({
          messages: { ...s.messages, [chatId]: msgs },
        }));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const onStop = () => {
    abortRef.current?.abort();
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

        <button
          className="btn btnIcon"
          type="button"
          onClick={onOpenSettings}
          title="Настройки"
        >
          <GearIcon />
        </button>
      </div>

      <div className="messages">
        <MessageList messages={messages} isTypingVisible={isLoading} />
        {error && (
          <div className="errorBanner" role="alert">
            <strong>Ошибка: </strong>{error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="inputArea">
        <InputArea onSend={onSend} onStop={onStop} isLoading={isLoading} />
      </div>
    </>
  );
}
