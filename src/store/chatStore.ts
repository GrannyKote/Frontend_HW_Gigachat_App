import { create } from "zustand";
import type { Chat, ChatAction, ChatId, ChatState, Message } from "../types";

const STORAGE_KEY = "hw2.chats";

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadPersistedState(): Partial<ChatState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<ChatState>;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

function persistState(state: ChatState): void {
  try {
    const toSave: Omit<ChatState, "isLoading" | "error"> = {
      chats: state.chats,
      messages: state.messages,
      activeChatId: state.activeChatId,
      chatCounter: state.chatCounter,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore quota errors
  }
}

// ── Title generation ──────────────────────────────────────────────────────────

export function generateChatTitle(firstMessage: string, counter: number): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length < 3) return `Диалог ${counter}`;
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 37) + "…";
}

// ── Store type ────────────────────────────────────────────────────────────────

type ChatStore = ChatState & {
  /** Redux-style dispatch for components that prefer action objects */
  dispatch: (action: ChatAction) => void;

  createChat: () => ChatId;
  deleteChat: (id: ChatId) => void;
  renameChat: (id: ChatId, title: string) => void;
  setActiveChat: (id: ChatId | null) => void;
  addMessage: (chatId: ChatId, message: Message) => void;
  updateMessage: (chatId: ChatId, messageId: string, text: string) => void;
  appendToMessage: (chatId: ChatId, messageId: string, chunk: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateChatTitleFromFirstMessage: (chatId: ChatId, firstMessage: string) => void;
};

// ── Initial state from localStorage ──────────────────────────────────────────

const persisted = loadPersistedState();

// ── Store ─────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: persisted.chats ?? [],
  messages: persisted.messages ?? {},
  activeChatId: persisted.activeChatId ?? null,
  isLoading: false,
  error: null,
  chatCounter: persisted.chatCounter ?? 0,

  dispatch: (action: ChatAction) => {
    const s = get();
    switch (action.type) {
      case "CREATE_CHAT":
        // createChat() handles full logic; dispatch is for external consumers
        break;
      case "DELETE_CHAT":
        s.deleteChat(action.payload);
        break;
      case "RENAME_CHAT":
        s.renameChat(action.payload.id, action.payload.title);
        break;
      case "SET_ACTIVE_CHAT":
        s.setActiveChat(action.payload);
        break;
      case "ADD_MESSAGE":
        s.addMessage(action.payload.chatId, action.payload.message);
        break;
      case "UPDATE_MESSAGE":
        s.updateMessage(action.payload.chatId, action.payload.messageId, action.payload.text);
        break;
      case "APPEND_TO_MESSAGE":
        s.appendToMessage(action.payload.chatId, action.payload.messageId, action.payload.chunk);
        break;
      case "SET_LOADING":
        s.setLoading(action.payload);
        break;
      case "SET_ERROR":
        s.setError(action.payload);
        break;
    }
  },

  createChat: () => {
    const counter = get().chatCounter + 1;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newChat: Chat = {
      id,
      title: `Новый чат`,
      lastMessageAt: now,
      createdAt: now,
    };
    set((state) => {
      const next: ChatState = {
        ...state,
        chats: [newChat, ...state.chats],
        messages: { ...state.messages, [id]: [] },
        activeChatId: id,
        chatCounter: counter,
      };
      persistState(next);
      return next;
    });
    return id;
  },

  deleteChat: (id: ChatId) => {
    set((state) => {
      const chats = state.chats.filter((c) => c.id !== id);
      const messages = { ...state.messages };
      delete messages[id];
      let activeChatId = state.activeChatId;
      if (activeChatId === id) {
        activeChatId = chats[0]?.id ?? null;
      }
      const next: ChatState = { ...state, chats, messages, activeChatId };
      persistState(next);
      return next;
    });
  },

  renameChat: (id: ChatId, title: string) => {
    set((state) => {
      const chats = state.chats.map((c) => (c.id === id ? { ...c, title } : c));
      const next: ChatState = { ...state, chats };
      persistState(next);
      return next;
    });
  },

  setActiveChat: (id: ChatId | null) => {
    set((state) => {
      const next: ChatState = { ...state, activeChatId: id };
      persistState(next);
      return next;
    });
  },

  addMessage: (chatId: ChatId, message: Message) => {
    set((state) => {
      const existing = state.messages[chatId] ?? [];
      const messages: Record<ChatId, Message[]> = {
        ...state.messages,
        [chatId]: [...existing, message],
      };
      const chats = state.chats.map((c) =>
        c.id === chatId ? { ...c, lastMessageAt: message.createdAt } : c,
      );
      const next: ChatState = { ...state, chats, messages };
      persistState(next);
      return next;
    });
  },

  updateMessage: (chatId: ChatId, messageId: string, text: string) => {
    set((state) => {
      const existing = state.messages[chatId] ?? [];
      const messages: Record<ChatId, Message[]> = {
        ...state.messages,
        [chatId]: existing.map((m) => (m.id === messageId ? { ...m, text } : m)),
      };
      const next: ChatState = { ...state, messages };
      persistState(next);
      return next;
    });
  },

  appendToMessage: (chatId: ChatId, messageId: string, chunk: string) => {
    // Hot path for streaming — skip persist to avoid excessive writes
    set((state) => {
      const existing = state.messages[chatId] ?? [];
      const messages: Record<ChatId, Message[]> = {
        ...state.messages,
        [chatId]: existing.map((m) =>
          m.id === messageId ? { ...m, text: m.text + chunk } : m,
        ),
      };
      return { ...state, messages };
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  updateChatTitleFromFirstMessage: (chatId: ChatId, firstMessage: string) => {
    const counter = get().chatCounter;
    const title = generateChatTitle(firstMessage, counter);
    get().renameChat(chatId, title);
  },
}));
