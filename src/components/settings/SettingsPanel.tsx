import { useMemo, useState } from "react";
import type { ModelName, Settings } from "../../types";

type Props = {
  settings: Settings;
  onSave: (next: Settings) => void;
  onReset: () => Settings;
  onClose: () => void;
};

const models: ModelName[] = [
  "GigaChat",
  "GigaChat-Plus",
  "GigaChat-Pro",
  "GigaChat-Max",
];

export default function SettingsPanel({ settings, onSave, onReset, onClose }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);

  const canSave = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [
    draft,
    settings,
  ]);

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Настройки"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row">
          <div className="drawerTitle">Настройки</div>
          <div className="spacer" />
          <button className="btn btnIcon" type="button" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        <div className="field">
          <div className="label">Модель</div>
          <select
            className="control"
            value={draft.model}
            onChange={(e) =>
              setDraft((s) => ({ ...s, model: e.target.value as ModelName }))
            }
          >
            {models.map((m) => (
              <option value={m} key={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <div className="label">Temperature: {draft.temperature.toFixed(2)}</div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={draft.temperature}
            onChange={(e) =>
              setDraft((s) => ({ ...s, temperature: Number(e.target.value) }))
            }
          />
        </div>

        <div className="field">
          <div className="label">Top-P: {draft.topP.toFixed(2)}</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={draft.topP}
            onChange={(e) => setDraft((s) => ({ ...s, topP: Number(e.target.value) }))}
          />
        </div>

        <div className="field">
          <div className="label">Max Tokens</div>
          <input
            className="control"
            type="number"
            min={1}
            max={32000}
            value={draft.maxTokens}
            onChange={(e) =>
              setDraft((s) => ({ ...s, maxTokens: Number(e.target.value) }))
            }
          />
        </div>

        <div className="field">
          <div className="label">System Prompt</div>
          <textarea
            className="control"
            rows={5}
            value={draft.systemPrompt}
            onChange={(e) => setDraft((s) => ({ ...s, systemPrompt: e.target.value }))}
          />
        </div>

        <div className="field">
          <div className="label">Тема</div>
          <label className="themeToggle" aria-label="Переключатель темы">
            <input
              className="themeToggleInput"
              type="checkbox"
              checked={draft.theme === "dark"}
              onChange={(e) =>
                setDraft((s) => ({ ...s, theme: e.target.checked ? "dark" : "light" }))
              }
            />
            <span className="themeToggleTrack">
              <span className="themeToggleThumb" />
            </span>
            <span>{draft.theme === "dark" ? "Тёмная" : "Светлая"}</span>
          </label>
        </div>

        <div className="row rowTopGap">
          <button
            className="btn"
            type="button"
            onClick={() => {
              const next = onReset();
              setDraft(next);
            }}
          >
            Сбросить
          </button>
          <div className="spacer" />
          <button
            className="btn btnPrimary"
            type="button"
            disabled={!canSave}
            onClick={() => onSave(draft)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

