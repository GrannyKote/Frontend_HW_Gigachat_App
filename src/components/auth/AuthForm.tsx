import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { Scope } from "../../types";
import ErrorMessage from "../ui/ErrorMessage";

type Props = {
  onLogin: (payload: {
    credentials: string;
    scope: Scope;
  }) => Promise<string | null>;
};

const scopes: { id: Scope; label: string }[] = [
  { id: "GIGACHAT_API_PERS", label: "GIGACHAT_API_PERS" },
  { id: "GIGACHAT_API_B2B", label: "GIGACHAT_API_B2B" },
  { id: "GIGACHAT_API_CORP", label: "GIGACHAT_API_CORP" },
];

const defaultScope =
  scopes.find((scopeOption) => scopeOption.id === import.meta.env.VITE_DEFAULT_SCOPE)?.id ??
  "GIGACHAT_API_PERS";

export default function AuthForm({ onLogin }: Props) {
  const [credentials, setCredentials] = useState("");
  const [scope, setScope] = useState<Scope>(defaultScope);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const validationError = useMemo(() => {
    if (!touched) return "";
    if (!credentials.trim()) return "Credentials не должны быть пустыми.";
    return "";
  }, [credentials, touched]);

  const displayError = authError || validationError;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setAuthError("");
    const trimmed = credentials.trim();
    if (!trimmed) return;

    setLoading(true);
    const err = await onLogin({ credentials: trimmed, scope });
    setLoading(false);

    if (err) {
      setAuthError(err);
    }
  };

  return (
    <div className="authPage">
      <form onSubmit={submit} className="authCard">
        <div className="authHeader">
          <div className="authTitle">Вход в GigaChat</div>
          <div className="authSubtitle">
            Введите ключ авторизации из личного кабинета GigaChat (Base64) или
            Client&nbsp;ID:Client&nbsp;Secret.
          </div>
        </div>

        <div className="field">
          <div className="label">Ключ авторизации</div>
          <input
            className="control"
            type="password"
            value={credentials}
            onChange={(e) => {
              setCredentials(e.target.value);
              setAuthError("");
            }}
            onBlur={() => setTouched(true)}
            placeholder="Base64-строка или client_id:client_secret"
            autoComplete="off"
            disabled={loading}
          />
          {displayError ? <ErrorMessage>{displayError}</ErrorMessage> : null}
        </div>

        <div className="field">
          <div className="label">Scope</div>
          <div className="scopeGrid">
            {scopes.map((s) => (
              <label key={s.id} className="scopeOption">
                <input
                  type="radio"
                  name="scope"
                  value={s.id}
                  checked={scope === s.id}
                  onChange={() => setScope(s.id)}
                  disabled={loading}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="row authActions">
          <button
            className="btn btnPrimary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Проверка…" : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
