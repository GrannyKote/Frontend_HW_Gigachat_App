import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AuthForm from "./components/auth/AuthForm";
import type { Scope, Settings } from "./types";
import { defaultSettings, loadSettings, saveSettings } from "./state/settings";
import { clearAuth, loadAuth, saveAuth } from "./state/auth";
import { clearTokenCache, getAccessToken } from "./services/gigachat";
import type { AppLayoutProps } from "./components/layout/AppLayout";

const HomeRoute = lazy(() => import("./routes/HomeRoute"));
const ChatRoute = lazy(() => import("./routes/ChatRoute"));

function RouteFallback() {
  return <div className="routeFallback">Загрузка интерфейса…</div>;
}

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const isAuthed = Boolean(auth?.credentials);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const onLogin = useCallback(
    async (payload: {
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
    },
    [],
  );

  const onLogout = useCallback(() => {
    clearAuth();
    clearTokenCache();
    setAuth(null);
  }, []);

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

  const layoutProps: AppLayoutProps = {
    onLogout,
    settingsApi,
    auth: auth!,
  };

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomeRoute {...layoutProps} />} />
        <Route path="/chat/:id" element={<ChatRoute {...layoutProps} />} />
      </Routes>
    </Suspense>
  );
}
