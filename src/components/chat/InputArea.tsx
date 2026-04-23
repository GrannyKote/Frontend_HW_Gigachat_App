import { useEffect, useRef } from "react";
import { StopIcon } from "../ui/icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  canSend: boolean;
  isLoading: boolean;
};

export default function InputArea({
  value,
  onChange,
  onSend,
  onStop,
  canSend,
  isLoading,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const trimmedValue = value.trim();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="inputRow">
      <textarea
        ref={ref}
        className="control inputTextarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Напишите сообщение…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSend(trimmedValue);
          }
        }}
      />

      {isLoading ? (
        <button className="btn btnDanger" type="button" onClick={onStop}>
          <StopIcon /> Стоп
        </button>
      ) : (
        <button
          className="btn btnPrimary"
          type="button"
          onClick={() => onSend(trimmedValue)}
          disabled={!canSend}
        >
          Отправить
        </button>
      )}
    </div>
  );
}
