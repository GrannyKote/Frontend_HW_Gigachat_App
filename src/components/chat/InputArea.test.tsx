import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputArea from "./InputArea";

describe("InputArea", () => {
  it("calls onSend with message text on button click", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <InputArea
        value="  Привет, мир  "
        onChange={vi.fn()}
        onSend={onSend}
        onStop={vi.fn()}
        canSend
        isLoading={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(onSend).toHaveBeenCalledWith("Привет, мир");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("calls onSend on Enter when textarea is not empty", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <InputArea
        value="Сообщение"
        onChange={vi.fn()}
        onSend={onSend}
        onStop={vi.fn()}
        canSend
        isLoading={false}
      />,
    );

    await user.type(screen.getByPlaceholderText("Напишите сообщение…"), "{enter}");

    expect(onSend).toHaveBeenCalledWith("Сообщение");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("disables send button when input is empty", () => {
    render(
      <InputArea
        value=""
        onChange={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        canSend={false}
        isLoading={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });
});
