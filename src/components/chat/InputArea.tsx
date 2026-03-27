import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "../ui/icons";

type Props = {
  onSend: (value: string) => void;
  onStop: () => void;
  isLoading: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function InputArea({ onSend, onStop, isLoading }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const maxHeight = 200;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = clamp(el.scrollHeight, 44, maxHeight);
    el.style.height = `${next}px`;
  }, [value, maxHeight]);

  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="row inputRow inputRowBottom">
      <button className="btn btnIcon" type="button" title="Прикрепить изображение">
        <ImageIcon />
      </button>

      <textarea
        ref={ref}
        className="control inputControl"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Напишите сообщение…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {isLoading ? (
        <button className="btn btnDanger inputActionBtn" type="button" onClick={onStop}>
          Стоп
        </button>
      ) : (
        <button
          className="btn btnPrimary inputActionBtn"
          type="button"
          onClick={handleSend}
          disabled={!canSend}
        >
          Отправить
        </button>
      )}
    </div>
  );
}

