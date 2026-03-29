import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { Toggle } from './components/ui/Toggle';
import appStyles from './App.module.css';
import { ChatProvider } from './app/providers/ChatProvider';
import { appRouter } from './app/router/routes';
import type { GigaChatAuthConfig, Scope } from './api/gigachat';
import './styles/theme.css';

function App() {
  const [auth, setAuth] = useState<GigaChatAuthConfig | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const handleLogin = (credentials: string, scope: Scope) => {
    setAuth({ credentials, scope });
  };

  if (!auth) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <ChatProvider auth={auth}>
      <>
        <div className={appStyles.themeToggleWrap}>
          <Toggle checked={isDarkTheme} onChange={setIsDarkTheme} label="Тёмная тема" />
        </div>
        <RouterProvider router={appRouter} />
      </>
    </ChatProvider>
  );
}

export default App;


