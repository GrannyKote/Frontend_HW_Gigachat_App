type Props = { children: string };

export default function ErrorMessage({ children }: Props) {
  return (
    <div className="errorMessage" role="alert">
      <span aria-hidden="true">!</span>
      <span>{children}</span>
    </div>
  );
}

