import type { Chat, Message } from "../types";

const STORAGE_KEY = "hw1.chats";

function createStorageMock(initialData: Record<string, string> = {}) {
  const store = { ...initialData };

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    }),
  };
}

async function loadStoreModule(storageData: Record<string, string> = {}) {
  vi.resetModules();

  const localStorageMock = createStorageMock(storageData);
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "generated-chat-id"),
  });

  const module = await import("./chatStore");

  return { ...module, localStorageMock };
}

function buildChat(id: string, title: string): Chat {
  return {
    id,
    title,
    lastMessageAt: "2026-04-10T09:00:00.000Z",
  };
}

function buildMessage(id: string, text: string): Message {
  return {
    id,
    role: "user",
    authorLabel: "Вы",
    text,
    createdAt: "2026-04-10T10:00:00.000Z",
  };
}

describe("useChatStore", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("adds a message to the end of chat messages", async () => {
    const { useChatStore } = await loadStoreModule();
    const chat = buildChat("chat-1", "Тестовый чат");
    const message = buildMessage("msg-1", "Новое сообщение");

    useChatStore.setState({
      chats: [chat],
      messagesByChat: { [chat.id]: [] },
      isLoading: false,
      error: null,
    });

    useChatStore.getState().addMessage(chat.id, message);

    const messages = useChatStore.getState().messagesByChat[chat.id];
    expect(messages).toHaveLength(1);
    expect(messages.at(-1)).toEqual(message);
  });

  it("creates a new chat with generated id and puts it into chats array", async () => {
    const { useChatStore } = await loadStoreModule();

    const createdId = useChatStore.getState().createChat("Новый диалог");

    expect(createdId).toBe("generated-chat-id");
    expect(useChatStore.getState().chats).toEqual([
      expect.objectContaining({
        id: "generated-chat-id",
        title: "Новый диалог",
      }),
    ]);
  });

  it("deletes chat from store and removes its messages", async () => {
    const { useChatStore } = await loadStoreModule();
    const firstChat = buildChat("chat-1", "Первый чат");
    const secondChat = buildChat("chat-2", "Второй чат");

    useChatStore.setState({
      chats: [firstChat, secondChat],
      messagesByChat: {
        [firstChat.id]: [buildMessage("msg-1", "Сообщение")],
        [secondChat.id]: [],
      },
      isLoading: false,
      error: null,
    });

    useChatStore.getState().deleteChat(firstChat.id);

    expect(useChatStore.getState().chats).toEqual([secondChat]);
    expect(useChatStore.getState().messagesByChat[firstChat.id]).toBeUndefined();
  });

  it("renames a chat by id", async () => {
    const { useChatStore } = await loadStoreModule();
    const chat = buildChat("chat-1", "Старое имя");

    useChatStore.setState({
      chats: [chat],
      messagesByChat: { [chat.id]: [] },
      isLoading: false,
      error: null,
    });

    useChatStore.getState().renameChat(chat.id, "Новое имя");

    expect(useChatStore.getState().chats[0]?.title).toBe("Новое имя");
  });

  it("saves chats to localStorage after state changes", async () => {
    const { useChatStore, localStorageMock } = await loadStoreModule();

    useChatStore.getState().createChat("Сохранённый чат");

    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      STORAGE_KEY,
      expect.any(String),
    );

    const savedPayload = JSON.parse(
      localStorageMock.setItem.mock.lastCall?.[1] as string,
    );

    expect(savedPayload.chats).toEqual([
      expect.objectContaining({
        id: "generated-chat-id",
        title: "Сохранённый чат",
      }),
    ]);
    expect(savedPayload.messagesByChat).toEqual({ "generated-chat-id": [] });
  });

  it("restores saved state from localStorage during initialization", async () => {
    const chat = buildChat("chat-1", "Восстановленный чат");
    const message = buildMessage("msg-1", "Из localStorage");
    const { useChatStore } = await loadStoreModule({
      [STORAGE_KEY]: JSON.stringify({
        chats: [chat],
        messagesByChat: { [chat.id]: [message] },
      }),
    });

    expect(useChatStore.getState().chats).toEqual([chat]);
    expect(useChatStore.getState().messagesByChat).toEqual({
      [chat.id]: [message],
    });
  });

  it("falls back to empty state when localStorage contains invalid JSON", async () => {
    const { useChatStore } = await loadStoreModule({
      [STORAGE_KEY]: "{broken-json",
    });

    expect(useChatStore.getState().chats).toEqual([]);
    expect(useChatStore.getState().messagesByChat).toEqual({});
  });
});
