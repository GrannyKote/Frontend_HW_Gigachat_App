import { useEffect, useMemo, useRef, useState } from "react";
import type { Message as MessageT } from "../../types";
import { BurgerIcon, GearIcon } from "../ui/icons";
import MessageList from "./MessageList";
import InputArea from "./InputArea";

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
  const [draft, setDraft] = useState("");
  const [isTypingVisible] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = draft.trim().length > 0;

  const renderedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [renderedMessages.length]);

  const onSend = () => {
    if (!canSend) return;
    setDraft("");
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

      <div className="messages" ref={listRef}>
        <MessageList messages={renderedMessages} isTypingVisible={isTypingVisible} />
      </div>

      <div className="inputArea">
        <InputArea
          value={draft}
          onChange={setDraft}
          onSend={onSend}
          canSend={canSend}
        />
      </div>
    </>
  );
}

