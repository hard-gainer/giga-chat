import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';

type GigaChatModel = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max';

interface SettingsState {
  model: GigaChatModel;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  darkTheme: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (dark: boolean) => void;
  isDarkTheme: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ИИ-ассистент GigaChat. Отвечай на русском языке, ясно и по существу.',
  darkTheme: false,
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onThemeChange,
  isDarkTheme,
}) => {
  const [settings, setSettings] = useState<SettingsState>({
    ...DEFAULT_SETTINGS,
    darkTheme: isDarkTheme,
  });

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onThemeChange(settings.darkTheme);
    onClose();
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS, darkTheme: isDarkTheme });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '360px',
          maxWidth: '100vw',
          background: 'var(--color-bg-modal)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Настройки
          </h2>
          <Button variant="icon" onClick={onClose} title="Закрыть">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Panel Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          {/* Model Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="model-select"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Модель
            </label>
            <select
              id="model-select"
              value={settings.model}
              onChange={(e) => update('model', e.target.value as GigaChatModel)}
              style={{
                padding: '9px 12px',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-input)',
                fontFamily: 'var(--font-family)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="GigaChat">GigaChat</option>
              <option value="GigaChat-Plus">GigaChat-Plus</option>
              <option value="GigaChat-Pro">GigaChat-Pro</option>
              <option value="GigaChat-Max">GigaChat-Max</option>
            </select>
          </div>

          {/* Temperature */}
          <Slider
            label="Temperature"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(v) => update('temperature', v)}
          />

          {/* Top-P */}
          <Slider
            label="Top-P"
            min={0}
            max={1}
            step={0.05}
            value={settings.topP}
            onChange={(v) => update('topP', v)}
          />

          {/* Max Tokens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="max-tokens"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Max Tokens
            </label>
            <input
              id="max-tokens"
              type="number"
              min={1}
              max={32768}
              value={settings.maxTokens}
              onChange={(e) => update('maxTokens', Number(e.target.value))}
              style={{
                padding: '9px 12px',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-input)',
                fontFamily: 'var(--font-family)',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {/* System Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="system-prompt"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              System Prompt
            </label>
            <textarea
              id="system-prompt"
              value={settings.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              rows={5}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-input)',
                fontFamily: 'var(--font-family)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.55,
              }}
            />
          </div>

          {/* Theme Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Тёмная тема
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Переключение светлой/тёмной темы
              </div>
            </div>
            <Toggle
              checked={settings.darkTheme}
              onChange={(v) => update('darkTheme', v)}
            />
          </div>
        </div>

        {/* Panel Footer */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <Button variant="secondary" size="md" onClick={handleReset} style={{ flex: 1 }}>
            Сбросить
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} style={{ flex: 2 }}>
            Сохранить
          </Button>
        </div>
      </div>
    </>
  );
};
