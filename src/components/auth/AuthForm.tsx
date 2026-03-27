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
    <div className="authPage">
      <form onSubmit={submit} className="authFormCard">
        <div className="authHeader">
          <div className="authTitle">Вход</div>
          <div className="authSubtitle">Моковая авторизация для оболочки приложения.</div>
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
          <div className="scopeGrid">
            {scopes.map((s) => (
              <label key={s.id} className="scopeItem">
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

        <div className="row rowTopGapSm">
          <button className="btn btnPrimary" type="submit">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}

