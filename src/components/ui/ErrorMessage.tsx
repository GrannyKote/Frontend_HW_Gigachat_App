import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export default function ErrorMessage({ children, actionLabel, onAction }: Props) {
  return (
    <div className="errorMessage" role="alert">
      <span aria-hidden="true">!</span>
      <span>{children}</span>
      {actionLabel && onAction ? (
        <button className="btn errorMessageAction" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

