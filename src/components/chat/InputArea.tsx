import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon } from "../ui/icons";

type Props = {
  onSend: (value: string) => void;
  isLoading: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function InputArea({ onSend, isLoading }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");

  const maxHeight = useMemo(() => {
    const el = ref.current;
    if (!el) return 200;
    const cs = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(cs.lineHeight || "20") || 20;
    const paddingTop = Number.parseFloat(cs.paddingTop || "0") || 0;
    const paddingBottom = Number.parseFloat(cs.paddingBottom || "0") || 0;
    return lineHeight * 5 + paddingTop + paddingBottom + 2;
  }, []);

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
    <div className="row" style={{ alignItems: "flex-end" }}>
      <button className="btn btnIcon" type="button" title="Прикрепить изображение">
        <ImageIcon />
      </button>

      <textarea
        ref={ref}
        className="control"
        style={{ flex: 1, minHeight: 44, maxHeight, overflow: "auto" }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Напишите сообщение…"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <button className="btn" type="button" disabled>
        Стоп
      </button>
      <button className="btn btnPrimary" type="button" onClick={handleSend} disabled={!canSend}>
        Отправить
      </button>
    </div>
  );
}

