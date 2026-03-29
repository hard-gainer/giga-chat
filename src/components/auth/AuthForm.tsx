import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import type { Scope } from '../../api/gigachat';

interface AuthFormProps {
  onLogin: (credentials: string, scope: Scope) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.trim()) {
      setError('Поле Credentials не может быть пустым');
      return;
    }
    setError('');
    onLogin(credentials, scope);
  };

  const scopes: { value: Scope; label: string }[] = [
    { value: 'GIGACHAT_API_PERS', label: 'GIGACHAT_API_PERS (Физические лица)' },
    { value: 'GIGACHAT_API_B2B', label: 'GIGACHAT_API_B2B (Корпоративные клиенты)' },
    { value: 'GIGACHAT_API_CORP', label: 'GIGACHAT_API_CORP (Корпоративные)' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-modal)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px rgba(108, 99, 255, 0.35)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '4px',
            }}
          >
            GigaChat
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Введите данные для авторизации
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="credentials"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              Credentials (Base64)
            </label>
            <input
              id="credentials"
              type="password"
              value={credentials}
              onChange={(e) => {
                setCredentials(e.target.value);
                if (error) setError('');
              }}
              placeholder="Введите Base64-строку авторизации..."
              style={{
                padding: '10px 14px',
                border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border-input)'}`,
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-input)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
                fontFamily: 'var(--font-family)',
              }}
            />
            {error && <ErrorMessage message={error} />}
          </div>

          {/* Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              Scope
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scopes.map((s) => (
                <label
                  key={s.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    padding: '8px 12px',
                    border: `1px solid ${scope === s.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    background: scope === s.value ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={s.value}
                    checked={scope === s.value}
                    onChange={() => setScope(s.value)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: '4px' }}>
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
};
