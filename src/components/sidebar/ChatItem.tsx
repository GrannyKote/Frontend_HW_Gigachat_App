import type { Chat } from "../../types";
import { EditIcon, TrashIcon } from "../ui/icons";

type Props = {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
};

export default function ChatItem({ chat, isActive, onSelect }: Props) {
  return (
    <div
      className={`chatItem ${isActive ? "chatItemActive" : ""}`}
      role="listitem"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
    >
      <div className="minW0">
        <div className="chatItemTitle" title={chat.title}>
          {chat.title}
        </div>
      </div>
      <div className="chatItemMeta">{formatDate(chat.lastMessageAt)}</div>

      <div className="chatItemActions" aria-label="Действия">
        <button className="btn miniIconBtn" type="button" title="Редактировать">
          <EditIcon />
        </button>
        <button className="btn miniIconBtn" type="button" title="Удалить">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

