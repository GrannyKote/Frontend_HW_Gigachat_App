import { loadAuth } from "../state/auth";
import type { Message, Settings } from "../types";

// ── Endpoints (proxied via Vite dev server) ───────────────────────────────────
// In production you would replace these with your backend proxy URLs.
const OAUTH_URL = "/api/gigachat-oauth/api/v2/oauth";
const CHAT_URL = "/api/gigachat-chat/api/v1/chat/completions";

// ── Token cache ───────────────────────────────────────────────────────────────

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.token;
  }

  const auth = loadAuth();
  if (!auth) throw new Error("Не авторизован. Пожалуйста, войдите снова.");

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth.credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      RqUID: crypto.randomUUID(),
    },
    body: `scope=${auth.scope}`,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка авторизации GigaChat: ${res.status}${text ? " — " + text : ""}`);
  }

  const data = (await res.json()) as { access_token: string; expires_at: number };
  tokenCache = { token: data.access_token, expiresAt: data.expires_at };
  return data.access_token;
}

// ── Types for API wire format ─────────────────────────────────────────────────

type GigaChatRole = "system" | "user" | "assistant";

interface GigaChatMessage {
  role: GigaChatRole;
  content: string;
}

interface StreamDelta {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

interface FullResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

// ── Build messages array ──────────────────────────────────────────────────────

function buildMessages(messages: Message[], systemPrompt: string): GigaChatMessage[] {
  const result: GigaChatMessage[] = [];
  if (systemPrompt.trim()) {
    result.push({ role: "system", content: systemPrompt.trim() });
  }
  for (const m of messages) {
    result.push({ role: m.role, content: m.text });
  }
  return result;
}

// ── Streaming request ─────────────────────────────────────────────────────────

export async function sendMessageStreaming(
  messages: Message[],
  settings: Settings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = await getAccessToken();

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model,
      messages: buildMessages(messages, settings.systemPrompt),
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка GigaChat API: ${res.status}${text ? " — " + text : ""}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Пустое тело ответа от GigaChat API");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are separated by "\n"; a complete event ends with "\n\n"
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;

        try {
          const parsed = JSON.parse(payload) as StreamDelta;
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // Ignore malformed SSE frames
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── Non-streaming fallback ────────────────────────────────────────────────────

export async function sendMessageRest(
  messages: Message[],
  settings: Settings,
  signal?: AbortSignal,
): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model,
      messages: buildMessages(messages, settings.systemPrompt),
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка GigaChat API: ${res.status}${text ? " — " + text : ""}`);
  }

  const data = (await res.json()) as FullResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Unified entry point — tries streaming, falls back to REST ─────────────────

export async function sendMessage(
  messages: Message[],
  settings: Settings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await sendMessageStreaming(messages, settings, onChunk, signal);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Streaming failed — fall back to full REST response
    const fullText = await sendMessageRest(messages, settings, signal);
    onChunk(fullText);
  }
}
