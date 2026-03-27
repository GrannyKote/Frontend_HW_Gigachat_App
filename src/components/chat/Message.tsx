import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message as MessageT } from "../../types";
type Variant = "user" | "assistant";

type MessageProps = {
  message: MessageT;
  variant?: Variant;
};

export default function Message({ message, variant }: MessageProps) {
  const isUser = (variant ?? message.role) === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`messageRow ${isUser ? "messageRowUser" : ""}`}>
      {!isUser ? (
        <div className="avatar" title="GigaChat" aria-label="GigaChat">
          G
        </div>
      ) : null}

      <div className={`bubble ${isUser ? "bubbleUser" : ""}`}>
        <div className="bubbleHeader">
          <div className="author">{message.authorLabel}</div>
          {!isUser ? (
            <button
              className={`copyBtn ${copied ? "copyBtnCopied" : ""}`}
              type="button"
              onClick={copy}
              title={copied ? "Скопировано" : "Копировать"}
            >
              {copied ? "Скопировано" : "Копировать"}
            </button>
          ) : null}
        </div>
        <div className="md">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

