import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { Scope } from "../../types";
import ErrorMessage from "../ui/ErrorMessage";

type Props = {
  onLogin: (payload: { credentials: string; scope: Scope }) => void;
};

const scopes: { id: Scope; label: string }[] = [
  { id: "GIGACHAT_API_PERS", label: "GIGACHAT_API_PERS" },
  { id: "GIGACHAT_API_B2B", label: "GIGACHAT_API_B2B" },
  { id: "GIGACHAT_API_CORP", label: "GIGACHAT_API_CORP" },
];

export default function AuthForm({ onLogin }: Props) {
  const [credentials, setCredentials] = useState("");
  const [scope, setScope] = useState<Scope>("GIGACHAT_API_PERS");
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (!touched) return "";
    if (!credentials.trim()) return "Credentials не должны быть пустыми.";
    return "";
  }, [credentials, touched]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!credentials.trim()) return;
    onLogin({ credentials: credentials.trim(), scope });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(520px, 100%)",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 750, marginBottom: 6 }}>
            Вход
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>
            Моковая авторизация для оболочки приложения.
          </div>
        </div>

        <div className="field">
          <div className="label">Credentials (Base64)</div>
          <input
            className="control"
            type="password"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Введите Base64-строку"
            autoComplete="off"
          />
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </div>

        <div className="field">
          <div className="label">Scope</div>
          <div style={{ display: "grid", gap: 8 }}>
            {scopes.map((s) => (
              <label
                key={s.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  background: "var(--color-surface-2)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value={s.id}
                  checked={scope === s.id}
                  onChange={() => setScope(s.id)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btnPrimary" type="submit">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}

