import { useMemo, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar";
import type { Chat } from "../../types";

const chats: Chat[] = [
  {
    id: "chat-1",
    title: "React patterns",
    lastMessageAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "chat-2",
    title: "Vitest setup",
    lastMessageAt: "2026-04-10T10:00:00.000Z",
  },
];

function SidebarHarness() {
  const [search, setSearch] = useState("");
  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [search]);

  return (
    <Sidebar
      search={search}
      onSearchChange={setSearch}
      chats={filteredChats}
      activeChatId={null}
      onChatSelect={vi.fn()}
      onNewChat={vi.fn()}
      onDeleteChat={vi.fn()}
      onRenameChat={vi.fn()}
      isOpen={false}
      onClose={vi.fn()}
    />
  );
}

describe("Sidebar", () => {
  it("filters chats by title when user types in search field", async () => {
    const user = userEvent.setup();

    render(<SidebarHarness />);

    await user.type(screen.getByPlaceholderText("Поиск по чатам"), "vitest");

    expect(screen.getByText("Vitest setup")).toBeInTheDocument();
    expect(screen.queryByText("React patterns")).not.toBeInTheDocument();
  });

  it("shows all chats when search query is empty", () => {
    render(<SidebarHarness />);

    expect(screen.getByText("React patterns")).toBeInTheDocument();
    expect(screen.getByText("Vitest setup")).toBeInTheDocument();
  });

  it("shows confirmation dialog after clicking delete button", async () => {
    const user = userEvent.setup();

    render(<SidebarHarness />);

    await user.click(screen.getAllByTitle("Удалить")[0]);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Удалить чат «React patterns»?")).toBeInTheDocument();
  });
});
