export default function EmptyState() {
  return (
    <div className="emptyState">
      <div className="emptyIcon" aria-hidden="true">
        +
      </div>
      <div>
        <div style={{ fontWeight: 650, marginBottom: 4 }}>Пустой чат</div>
        <div>Начните новый диалог</div>
      </div>
    </div>
  );
}

