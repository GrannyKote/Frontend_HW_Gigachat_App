type Props = {
  onNewChat?: () => void;
};

export default function EmptyState({ onNewChat }: Props) {
  return (
    <div className="emptyState">
      <div className="emptyIcon" aria-hidden="true">
        +
      </div>
      <div>
        <div className="emptyStateTitle">Начните новый диалог</div>
        <div>Создайте чат, чтобы начать общение с GigaChat</div>
      </div>
      {onNewChat && (
        <button className="btn btnPrimary" type="button" onClick={onNewChat}>
          Новый чат
        </button>
      )}
    </div>
  );
}
