import type { Chat, Message } from "./types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

export const mockChats: Chat[] = [
  { id: "c1", title: "План на неделю по фронтенду", lastMessageAt: iso(daysAgo(0)), createdAt: iso(daysAgo(0)) },
  { id: "c2", title: "Разбор CSS Grid и Flexbox (конспект)", lastMessageAt: iso(daysAgo(1)), createdAt: iso(daysAgo(1)) },
  { id: "c3", title: "Идеи для pet-проекта: трекер привычек", lastMessageAt: iso(daysAgo(2)), createdAt: iso(daysAgo(2)) },
  { id: "c4", title: "Ошибки в TypeScript: union vs enum", lastMessageAt: iso(daysAgo(5)), createdAt: iso(daysAgo(5)) },
  { id: "c5", title: "Подготовка к собеседованию: React вопросы", lastMessageAt: iso(daysAgo(8)), createdAt: iso(daysAgo(8)) },
];

export const mockMessagesByChatId: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      role: "assistant",
      authorLabel: "GigaChat",
      createdAt: iso(daysAgo(0)),
      text: "Вот черновик плана на неделю:\n\n- **День 1**: повторить JSX/TSX и типы\n- **День 2**: хуки React\n- **День 3**: маршрутизация и состояние\n\n```ts\ntype Day = { title: string; tasks: string[] }\n```",
    },
    {
      id: "m2",
      role: "user",
      authorLabel: "Вы",
      createdAt: iso(daysAgo(0)),
      text: "Сделай упор на практику и мини-задачи.",
    },
    {
      id: "m3",
      role: "assistant",
      authorLabel: "GigaChat",
      createdAt: iso(daysAgo(0)),
      text: "Ок! Добавляю мини-задачи:\n\n1. Сверстать layout (sidebar + chat)\n2. Сделать компонент `Message` с markdown\n3. Добавить **адаптивность** и темы",
    },
    {
      id: "m4",
      role: "user",
      authorLabel: "Вы",
      createdAt: iso(daysAgo(0)),
      text: "А как лучше хранить настройки модели?",
    },
    {
      id: "m5",
      role: "assistant",
      authorLabel: "GigaChat",
      createdAt: iso(daysAgo(0)),
      text: "Для моков достаточно локального состояния + `localStorage`.\n\n- *UI*: панель настроек\n- *Хранение*: сериализовать объект настроек",
    },
    {
      id: "m6",
      role: "user",
      authorLabel: "Вы",
      createdAt: iso(daysAgo(0)),
      text: "Отлично, спасибо!",
    },
  ],
  c2: [],
  c3: [],
  c4: [],
  c5: [],
};

