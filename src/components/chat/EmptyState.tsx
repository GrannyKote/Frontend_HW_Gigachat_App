export default function EmptyState() {
  return (
    <div className="emptyState">
      <div className="emptyIcon" aria-hidden="true">
        +
      </div>
      <div>
        <div className="emptyStateTitle">Пустой чат</div>
        <div>Начните новый диалог</div>
      </div>
    </div>
  );
}

