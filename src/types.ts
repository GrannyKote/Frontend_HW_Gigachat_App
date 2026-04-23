export type ChatId = string;

export type Chat = {
  id: ChatId;
  title: string;
  lastMessageAt: string; // ISO
};

export type MessageRole = "user" | "assistant" | "system";

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

export type ChatState = {
  chats: Chat[];
  messagesByChat: Record<ChatId, Message[]>;
  activeChatId: ChatId | null;
  isLoading: boolean;
  error: string | null;
};

export type ChatAction =
  | { type: "CREATE_CHAT"; chat: Chat }
  | { type: "DELETE_CHAT"; id: ChatId }
  | { type: "RENAME_CHAT"; id: ChatId; title: string }
  | { type: "SET_ACTIVE_CHAT"; id: ChatId | null }
  | { type: "ADD_MESSAGE"; chatId: ChatId; message: Message }
  | { type: "UPDATE_MESSAGE"; chatId: ChatId; messageId: string; text: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "LOAD_STATE"; chats: Chat[]; messagesByChat: Record<ChatId, Message[]> };
