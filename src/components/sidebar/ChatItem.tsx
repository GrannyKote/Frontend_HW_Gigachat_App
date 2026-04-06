import { useEffect, useRef, useState } from "react";
import type { Chat } from "../../types";
import { EditIcon, TrashIcon } from "../ui/icons";
import ConfirmDialog from "../ui/ConfirmDialog";

type Props = {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
};

export default function ChatItem({
  chat,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const saveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== chat.title) {
      onRename(trimmed);
    } else {
      setEditTitle(chat.title);
    }
    setIsEditing(false);
  };

  return (
    <>
      <div
        className={`chatItem ${isActive ? "chatItemActive" : ""}`}
        role="listitem"
        tabIndex={0}
        onClick={() => !isEditing && onSelect()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isEditing) onSelect();
        }}
      >
        <div className="chatItemContent">
          {isEditing ? (
            <input
              ref={inputRef}
              className="chatItemEditInput"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditTitle(chat.title);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="chatItemTitle" title={chat.title}>
              {chat.title}
            </div>
          )}
        </div>
        <div className="chatItemMeta">{formatDate(chat.lastMessageAt)}</div>

        <div className="chatItemActions" aria-label="Действия">
          <button
            className="btn miniIconBtn"
            type="button"
            title="Редактировать"
            onClick={(e) => {
              e.stopPropagation();
              setEditTitle(chat.title);
              setIsEditing(true);
            }}
          >
            <EditIcon />
          </button>
          <button
            className="btn miniIconBtn"
            type="button"
            title="Удалить"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={`Удалить чат «${chat.title}»?`}
          onConfirm={() => {
            setShowConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
