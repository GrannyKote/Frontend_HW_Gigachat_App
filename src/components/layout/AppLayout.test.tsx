import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useChatStore } from "../../state/chatStore";
import type { Settings } from "../../types";

vi.mock("../chat/ChatWindow", () => ({
  default: ({ chatTitle }: { chatTitle: string }) => <div>{chatTitle}</div>,
}));

vi.mock("../settings/SettingsPanel", () => ({
  default: () => <div>Settings panel</div>,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const settings: Settings = {
  model: "GigaChat",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: "test",
  theme: "dark",
};

describe("AppLayout", () => {
  beforeEach(() => {
    useChatStore.setState({
      chats: [
        {
          id: "chat-1",
          title: "Активный чат",
          lastMessageAt: "2026-04-10T09:00:00.000Z",
        },
        {
          id: "chat-2",
          title: "Другой чат",
          lastMessageAt: "2026-04-10T10:00:00.000Z",
        },
      ],
      messagesByChat: {
        "chat-1": [],
        "chat-2": [],
      },
      isLoading: false,
      error: null,
    });
  });

  it("navigates to root after deleting the active chat", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/chat/chat-1"]}>
        <LocationDisplay />
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout
                onLogout={vi.fn()}
                settingsApi={{
                  settings,
                  setSettings: vi.fn(),
                  reset: vi.fn(() => settings),
                }}
                auth={{
                  credentials: "token",
                  scope: "GIGACHAT_API_PERS",
                }}
              />
            }
          />
          <Route
            path="/chat/:id"
            element={
              <AppLayout
                onLogout={vi.fn()}
                settingsApi={{
                  settings,
                  setSettings: vi.fn(),
                  reset: vi.fn(() => settings),
                }}
                auth={{
                  credentials: "token",
                  scope: "GIGACHAT_API_PERS",
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    const activeChatItem = within(screen.getByRole("list"))
      .getByText("Активный чат")
      .closest('[role="listitem"]');

    expect(activeChatItem).not.toBeNull();

    await user.click(within(activeChatItem as HTMLElement).getByTitle("Удалить"));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Удалить",
      }),
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });
});
