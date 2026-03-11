import type { Settings } from "../types";

const KEY = "hw1.settings";

export const defaultSettings: Settings = {
  model: "GigaChat",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: "Ты — полезный ассистент. Отвечай кратко и по делу.",
  theme: "dark",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(next: Settings) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

