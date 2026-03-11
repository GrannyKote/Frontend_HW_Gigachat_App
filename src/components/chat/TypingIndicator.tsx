type Props = { isVisible?: boolean };

export default function TypingIndicator({ isVisible }: Props) {
  if (!isVisible) return null;

  return (
    <div className="messageRow">
      <div className="avatar" title="GigaChat" aria-label="GigaChat">
        G
      </div>
      <div className="bubble">
        <div className="typing" aria-label="Ассистент печатает">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  );
}

