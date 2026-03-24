import type { Message as MessageT } from "../../types";
import EmptyState from "./EmptyState";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

type Props = {
  messages: MessageT[];
  isTypingVisible?: boolean;
};

export default function MessageList({ messages, isTypingVisible }: Props) {
  if (messages.length === 0) return <EmptyState />;

  return (
    <>
      {messages.map((m) => (
        <Message key={m.id} message={m} variant={m.role} />
      ))}
      <TypingIndicator isVisible={Boolean(isTypingVisible)} />
    </>
  );
}

