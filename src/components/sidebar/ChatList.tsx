import type { Chat, ChatId } from "../../types";
import ChatItem from "./ChatItem";

type Props = {
  chats: Chat[];
  activeChatId: ChatId | null;
  onChatSelect: (id: ChatId) => void;
  onDeleteChat: (id: ChatId) => void;
  onRenameChat: (id: ChatId, title: string) => void;
};

export default function ChatList({
  chats,
  activeChatId,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
}: Props) {
  return (
    <div className="chatList" role="list">
      {chats.length === 0 ? (
        <div className="chatListEmpty">Нет чатов</div>
      ) : (
        chats.map((c) => (
          <ChatItem
            key={c.id}
            chat={c}
            isActive={c.id === activeChatId}
            onSelect={() => onChatSelect(c.id)}
            onDelete={() => onDeleteChat(c.id)}
            onRename={(title) => onRenameChat(c.id, title)}
          />
        ))
      )}
    </div>
  );
}
