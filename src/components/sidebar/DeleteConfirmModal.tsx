type Props = {
  chatTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmModal({ chatTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="modalBackdrop" role="presentation" onClick={onCancel}>
      <div
        className="modalBox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-dialog-title" className="modalTitle">
          Удалить чат?
        </h3>
        <p className="modalBody">
          Чат <strong>«{chatTitle}»</strong> будет удалён без возможности
          восстановления.
        </p>
        <div className="modalActions">
          <button className="btn" type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btnDanger" type="button" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
