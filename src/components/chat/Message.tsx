import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import type { Message as MessageT } from "../../types";

type Props = { message: MessageT };

export default function Message({ message }: Props) {
  const isUser = message.role === "user";
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
      {!isUser && (
        <div className="avatar" title="GigaChat" aria-label="GigaChat">
          G
        </div>
      )}

      <div className={`bubble ${isUser ? "bubbleUser" : ""}`}>
        <div className="bubbleHeader">
          <div className="author">{message.authorLabel}</div>
          {!isUser && (
            <button
              className={copied ? "copiedBtn" : "copyBtn"}
              type="button"
              onClick={copy}
              title="Копировать"
            >
              {copied ? "Скопировано" : "Копировать"}
            </button>
          )}
        </div>
        <div className="md">
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
