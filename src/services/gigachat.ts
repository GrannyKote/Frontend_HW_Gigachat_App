import type { Settings, Scope } from "../types";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Prepare credentials for the Authorization: Basic header.
 *  - "client_id:client_secret" (contains colon) → Base64-encode via btoa()
 *  - Anything else (Authorization Data from portal) → use as-is
 * Strips whitespace / newlines introduced by copy-paste.
 */
function prepareCredentials(raw: string): string {
  const cleaned = raw.replace(/\s/g, "");
  if (!cleaned) return "";

  if (cleaned.includes(":")) {
    return btoa(cleaned);
  }

  return cleaned;
}

export async function getAccessToken(
  credentials: string,
  scope: Scope,
): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const prepared = prepareCredentials(credentials);
  if (!prepared) {
    throw new Error(
      "Credentials пусты. Введите Authorization Data из личного кабинета GigaChat.",
    );
  }

  const res = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${prepared}`,
      RqUID: crypto.randomUUID(),
    },
    body: `scope=${scope}`,
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      throw new Error(
        "Неверный ключ авторизации. Проверьте, что вы скопировали " +
          "полный ключ из личного кабинета GigaChat (раздел «Авторизационные данные»).",
      );
    }
    throw new Error(`Ошибка авторизации (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: data.expires_at,
  };

  return data.access_token;
}

export function clearTokenCache() {
  cachedToken = null;
}

export async function sendChatCompletion(
  token: string,
  messages: { role: string; content: string }[],
  settings: Settings,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/gigachat/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: true,
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        /* skip malformed chunk */
      }
    }
  }
}

export async function sendChatCompletionSync(
  token: string,
  messages: { role: string; content: string }[],
  settings: Settings,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/gigachat/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: false,
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
