type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="overlay overlayCenter"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="confirmDialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="confirmMessage">{message}</div>
        <div className="row confirmActions">
          <button className="btn" onClick={onCancel} type="button">
            Отмена
          </button>
          <button className="btn btnDanger" onClick={onConfirm} type="button">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
