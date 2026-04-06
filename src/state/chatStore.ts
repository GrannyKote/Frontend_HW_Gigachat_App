import { create } from "zustand";
import type { Chat, ChatId, Message } from "../types";

const STORAGE_KEY = "hw1.chats";

function loadFromStorage(): {
  chats: Chat[];
  messagesByChat: Record<string, Message[]>;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      data &&
      Array.isArray(data.chats) &&
      typeof data.messagesByChat === "object" &&
      data.messagesByChat !== null
    ) {
      return { chats: data.chats, messagesByChat: data.messagesByChat };
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(
  chats: Chat[],
  messagesByChat: Record<string, Message[]>,
) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, messagesByChat }));
  } catch {
    /* storage full or unavailable */
  }
}

interface ChatStore {
  chats: Chat[];
  messagesByChat: Record<ChatId, Message[]>;
  isLoading: boolean;
  error: string | null;

  createChat: (title?: string) => ChatId;
  deleteChat: (id: ChatId) => void;
  renameChat: (id: ChatId, title: string) => void;
  addMessage: (chatId: ChatId, message: Message) => void;
  updateMessage: (chatId: ChatId, messageId: string, text: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initial = loadFromStorage();

export const useChatStore = create<ChatStore>((set) => ({
  chats: initial?.chats ?? [],
  messagesByChat: initial?.messagesByChat ?? {},
  isLoading: false,
  error: null,

  createChat: (title) => {
    const id = crypto.randomUUID();
    const chat: Chat = {
      id,
      title: title || "Новый чат",
      lastMessageAt: new Date().toISOString(),
    };
    set((state) => ({
      chats: [chat, ...state.chats],
      messagesByChat: { ...state.messagesByChat, [id]: [] },
    }));
    return id;
  },

  deleteChat: (id) => {
    set((state) => {
      const chats = state.chats.filter((c) => c.id !== id);
      const { [id]: _, ...messagesByChat } = state.messagesByChat;
      void _;
      return { chats, messagesByChat };
    });
  },

  renameChat: (id, title) => {
    set((state) => ({
      chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const msgs = state.messagesByChat[chatId] ?? [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...msgs, message],
        },
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, lastMessageAt: message.createdAt } : c,
        ),
      };
    });
  },

  updateMessage: (chatId, messageId, text) => {
    set((state) => {
      const msgs = state.messagesByChat[chatId] ?? [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: msgs.map((m) =>
            m.id === messageId ? { ...m, text } : m,
          ),
        },
      };
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

useChatStore.subscribe((state) => {
  saveToStorage(state.chats, state.messagesByChat);
});
