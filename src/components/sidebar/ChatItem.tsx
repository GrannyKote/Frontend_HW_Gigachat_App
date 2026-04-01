import { useEffect, useRef, useState } from "react";
import type { Chat, ChatId } from "../../types";
import { EditIcon, TrashIcon } from "../ui/icons";

type Props = {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: ChatId, title: string) => void;
  onDelete: (id: ChatId) => void;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
};

export default function ChatItem({ chat, isActive, onSelect, onRename, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(chat.title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, chat.title]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== chat.title) {
      onRename(chat.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat.id);
  };

  return (
    <div
      className={`chatItem ${isActive ? "chatItemActive" : ""}`}
      role="listitem"
      tabIndex={isEditing ? -1 : 0}
      onClick={isEditing ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!isEditing && e.key === "Enter") onSelect();
      }}
    >
      <div className="minW0" style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            ref={inputRef}
            className="control chatItemEditInput"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="chatItemTitle" title={chat.title}>
            {chat.title}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="chatItemMeta">{formatDate(chat.lastMessageAt)}</div>
      )}

      <div className="chatItemActions" aria-label="Действия">
        <button
          className="btn miniIconBtn"
          type="button"
          title="Переименовать"
          onClick={handleEditClick}
        >
          <EditIcon />
        </button>
        <button
          className="btn miniIconBtn"
          type="button"
          title="Удалить"
          onClick={handleDeleteClick}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
