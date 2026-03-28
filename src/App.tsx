import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AuthForm, type Scope } from './components/auth/AuthForm';
import { Toggle } from './components/ui/Toggle';
import appStyles from './App.module.css';
import './styles/theme.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const handleLogin = (_credentials: string, _scope: Scope) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <>
      <div className={appStyles.themeToggleWrap}>
        <Toggle checked={isDarkTheme} onChange={setIsDarkTheme} label="Тёмная тема" />
      </div>
      <AppLayout isDarkTheme={isDarkTheme} onThemeChange={setIsDarkTheme} />
    </>
  );
}

export default App;


