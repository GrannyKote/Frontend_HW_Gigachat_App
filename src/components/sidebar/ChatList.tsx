import type { Chat, ChatId } from "../../types";
import ChatItem from "./ChatItem";

type Props = {
  chats: Chat[];
  activeChatId: ChatId;
  onChatSelect: (id: ChatId) => void;
  onRenameChat: (id: ChatId, title: string) => void;
  onDeleteChat: (id: ChatId) => void;
};

export default function ChatList({
  chats,
  activeChatId,
  onChatSelect,
  onRenameChat,
  onDeleteChat,
}: Props) {
  if (chats.length === 0) {
    return (
      <div className="chatListEmpty">
        <span>Нет чатов</span>
      </div>
    );
  }

  return (
    <div className="chatList" role="list">
      {chats.map((c) => (
        <ChatItem
          key={c.id}
          chat={c}
          isActive={c.id === activeChatId}
          onSelect={() => onChatSelect(c.id)}
          onRename={onRenameChat}
          onDelete={onDeleteChat}
        />
      ))}
    </div>
  );
}
