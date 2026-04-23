export type ChatId = string;

export type Chat = {
  id: ChatId;
  title: string;
  lastMessageAt: string; // ISO
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

