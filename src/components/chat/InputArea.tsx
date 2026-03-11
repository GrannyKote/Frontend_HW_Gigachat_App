import { useEffect, useMemo, useRef } from "react";
import { ImageIcon } from "../ui/icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  canSend: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function InputArea({ value, onChange, onSend, canSend }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

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
        onChange={(e) => onChange(e.target.value)}
        placeholder="Напишите сообщение…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />

      <button className="btn" type="button" disabled>
        Стоп
      </button>
      <button className="btn btnPrimary" type="button" onClick={onSend} disabled={!canSend}>
        Отправить
      </button>
    </div>
  );
}

