import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { ChatProvider } from './app/providers/ChatProvider';
import { appRouter } from './app/router/routes';
import type { GigaChatAuthConfig, Scope } from './api/gigachat';
import './styles/theme.css';

const DEFAULT_SCOPE: Scope = 'GIGACHAT_API_PERS';
const ALLOWED_SCOPES: Scope[] = ['GIGACHAT_API_PERS', 'GIGACHAT_API_B2B', 'GIGACHAT_API_CORP'];

const resolveScope = (scope: string | undefined): Scope => {
  if (!scope) return DEFAULT_SCOPE;
  return ALLOWED_SCOPES.includes(scope as Scope) ? (scope as Scope) : DEFAULT_SCOPE;
};

function App() {
  const [auth, setAuth] = useState<GigaChatAuthConfig | null>(() => {
    const credentials = import.meta.env.VITE_GIGACHAT_CREDENTIALS as string | undefined;
    if (!credentials?.trim()) return null;

    const envScope = import.meta.env.VITE_GIGACHAT_SCOPE as string | undefined;
    return {
      credentials,
      scope: resolveScope(envScope),
    };
  });

  const handleLogin = (credentials: string, scope: Scope) => {
    setAuth({ credentials, scope });
  };

  if (!auth) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <ChatProvider auth={auth}>
      <RouterProvider router={appRouter} />
    </ChatProvider>
  );
}

export default App;


