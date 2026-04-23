import { useEffect, useMemo, useRef, useState } from "react";
import type { Message as MessageT, MessageRole } from "../../types";
import { BurgerIcon, GearIcon } from "../ui/icons";
import MessageList from "./MessageList";
import InputArea from "./InputArea";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
};

type Props = {
  chatTitle: string;
  messages: MessageT[];
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
};

export default function ChatWindow({
  chatTitle,
  messages,
  onOpenSidebar,
  onOpenSettings,
}: Props) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setChatMessages(
      messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.text,
        timestamp: m.createdAt,
      })),
    );
    setIsLoading(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [messages, chatTitle]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const renderedMessages = useMemo<MessageT[]>(
    () =>
      chatMessages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.content,
        createdAt: m.timestamp,
        authorLabel: m.role === "user" ? "Вы" : "GigaChat",
      })),
    [chatMessages],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [renderedMessages]);

  const onSend = (value: string) => {
    if (!value.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: value,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const delay = 1000 + Math.floor(Math.random() * 1001);
    timeoutRef.current = window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Это мок-ответ ассистента. Позже здесь будет реальный ответ API.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      timeoutRef.current = null;
    }, delay);
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
        <MessageList messages={renderedMessages} isTypingVisible={isLoading} />
        <div ref={endRef} />
      </div>

      <div className="inputArea">
        <InputArea onSend={onSend} isLoading={isLoading} />
      </div>
    </>
  );
}

