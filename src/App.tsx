import { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthForm from "./components/auth/AuthForm";
import type { Scope, Settings } from "./types";
import { defaultSettings, loadSettings, saveSettings } from "./state/settings";
import { clearAuth, loadAuth, saveAuth } from "./state/auth";
import { clearTokenCache, getAccessToken } from "./services/gigachat";

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const isAuthed = Boolean(auth?.credentials);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const onLogin = async (payload: {
    credentials: string;
    scope: Scope;
  }): Promise<string | null> => {
    try {
      clearTokenCache();
      await getAccessToken(payload.credentials, payload.scope);
      saveAuth(payload);
      setAuth(payload);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Ошибка авторизации";
    }
  };

  const onLogout = () => {
    clearAuth();
    clearTokenCache();
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout
            onLogout={onLogout}
            settingsApi={settingsApi}
            auth={auth!}
          />
        }
      />
      <Route
        path="/chat/:id"
        element={
          <AppLayout
            onLogout={onLogout}
            settingsApi={settingsApi}
            auth={auth!}
          />
        }
      />
    </Routes>
  );
}
