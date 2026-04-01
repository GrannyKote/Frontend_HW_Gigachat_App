export type ChatId = string;

export type Chat = {
  id: ChatId;
  title: string;
  lastMessageAt: string; // ISO
  createdAt: string; // ISO
};

export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  authorLabel: string;
  text: string;
  createdAt: string; // ISO
};

export type ModelName =
  | "GigaChat"
  | "GigaChat-Plus"
  | "GigaChat-Pro"
  | "GigaChat-Max";

export type Scope =
  | "GIGACHAT_API_PERS"
  | "GIGACHAT_API_B2B"
  | "GIGACHAT_API_CORP";

export type Settings = {
  model: ModelName;
  temperature: number; // 0..2
  topP: number; // 0..1
  maxTokens: number;
  systemPrompt: string;
  theme: "light" | "dark";
};

// ── Global chat state shape ──────────────────────────────────────────────────

export type ChatState = {
  chats: Chat[];
  messages: Record<ChatId, Message[]>;
  activeChatId: ChatId | null;
  isLoading: boolean;
  error: string | null;
  chatCounter: number; // monotonic counter for default titles
};

// ── Discriminated-union actions (Redux-style, used in dispatch) ───────────────

export type ChatAction =
  | { type: "CREATE_CHAT"; payload: Chat }
  | { type: "DELETE_CHAT"; payload: ChatId }
  | { type: "RENAME_CHAT"; payload: { id: ChatId; title: string } }
  | { type: "SET_ACTIVE_CHAT"; payload: ChatId | null }
  | { type: "ADD_MESSAGE"; payload: { chatId: ChatId; message: Message } }
  | { type: "UPDATE_MESSAGE"; payload: { chatId: ChatId; messageId: string; text: string } }
  | { type: "APPEND_TO_MESSAGE"; payload: { chatId: ChatId; messageId: string; chunk: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
