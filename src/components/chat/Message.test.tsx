import { render, screen } from "@testing-library/react";
import Message from "./Message";
import type { Message as MessageType } from "../../types";

function buildMessage(role: MessageType["role"], text: string): MessageType {
  return {
    id: `${role}-1`,
    role,
    authorLabel: role === "user" ? "Вы" : "GigaChat",
    text,
    createdAt: "2026-04-10T12:00:00.000Z",
  };
}

describe("Message", () => {
  it("renders user message text with user CSS class", () => {
    const { container } = render(
      <Message message={buildMessage("user", "Текст пользователя")} />,
    );

    expect(screen.getByText("Текст пользователя")).toBeInTheDocument();
    expect(container.querySelector(".messageRowUser")).toBeInTheDocument();
    expect(container.querySelector(".bubbleUser")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Копировать" }),
    ).not.toBeInTheDocument();
  });

  it("renders assistant message text with assistant CSS class", () => {
    const { container } = render(
      <Message message={buildMessage("assistant", "Ответ ассистента")} />,
    );

    expect(screen.getByText("Ответ ассистента")).toBeInTheDocument();
    expect(container.querySelector(".messageRowAssistant")).toBeInTheDocument();
    expect(container.querySelector(".bubbleAssistant")).toBeInTheDocument();
  });

  it("shows copy button only for assistant messages", () => {
    render(<Message message={buildMessage("assistant", "Можно копировать")} />);

    expect(screen.getByRole("button", { name: "Копировать" })).toBeInTheDocument();
  });
});
