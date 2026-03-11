import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import AuthForm from "./components/auth/AuthForm";
import type { Scope, Settings } from "./types";
import { defaultSettings, loadSettings, saveSettings } from "./state/settings";
import { clearAuth, loadAuth, saveAuth } from "./state/auth";

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const isAuthed = Boolean(auth?.credentials);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const onLogin = (payload: { credentials: string; scope: Scope }) => {
    saveAuth(payload);
    setAuth(payload);
  };

  const onLogout = () => {
    clearAuth();
    setAuth(null);
  };

  const settingsApi = useMemo(
    () => ({
      settings,
      setSettings: (next: Settings) => {
        setSettings(next);
        saveSettings(next);
      },
      reset: () => {
        setSettings(defaultSettings);
        saveSettings(defaultSettings);
        return defaultSettings;
      },
    }),
    [settings],
  );

  if (!isAuthed) {
    return <AuthForm onLogin={onLogin} />;
  }

  return <AppLayout onLogout={onLogout} settingsApi={settingsApi} />;
}

