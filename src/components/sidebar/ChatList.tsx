import type { Chat, ChatId } from "../../types";
import ChatItem from "./ChatItem";

type Props = {
  chats: Chat[];
  activeChatId: ChatId;
  onChatSelect: (id: ChatId) => void;
};

export default function ChatList({ chats, activeChatId, onChatSelect }: Props) {
  return (
    <div className="chatList" role="list">
      {chats.map((c) => (
        <ChatItem
          key={c.id}
          chat={c}
          isActive={c.id === activeChatId}
          onSelect={() => onChatSelect(c.id)}
        />
      ))}
    </div>
  );
}

