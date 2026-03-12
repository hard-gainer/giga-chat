import React from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import type { MessageData } from './Message';
import { Button } from '../ui/Button';

const MOCK_MESSAGES: MessageData[] = [
  {
    id: '1',
    role: 'user',
    content: 'Привет! Можешь объяснить, как работает `useEffect` в React?',
    timestamp: '14:20',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Конечно! `useEffect` — это хук в React, который позволяет выполнять _побочные эффекты_ в функциональных компонентах.\n\nОн принимает два аргумента:\n1. **Функция эффекта** — выполняется после рендера\n2. **Массив зависимостей** — определяет, когда эффект запускается повторно\n\n```typescript\nuseEffect(() => {\n  document.title = `Чат: ${chatName}`;\n}, [chatName]);\n```\n\nЕсли массив зависимостей пустой `[]`, эффект выполнится только один раз при монтировании.',
    timestamp: '14:21',
  },
  {
    id: '3',
    role: 'user',
    content: 'А как правильно делать cleanup в useEffect?',
    timestamp: '14:22',
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'Для cleanup нужно **вернуть функцию** из эффекта:\n\n```typescript\nuseEffect(() => {\n  const subscription = someAPI.subscribe();\n  \n  return () => {\n    // Cleanup: отписываемся при размонтировании\n    subscription.unsubscribe();\n  };\n}, []);\n```\n\nЭто важно для:\n- Отписки от событий\n- Отмены таймеров (`clearTimeout`)\n- Закрытия WebSocket-соединений',
    timestamp: '14:23',
  },
  {
    id: '5',
    role: 'user',
    content: 'Спасибо! Теперь понятно. Ещё вопрос — в чём разница между useEffect и useLayoutEffect?',
    timestamp: '14:25',
  },
  {
    id: '6',
    role: 'assistant',
    content:
      'Главное отличие — **время выполнения**:\n\n- `useEffect` — запускается **асинхронно** после того, как браузер отрисовал изменения\n- `useLayoutEffect` — запускается **синхронно** сразу после DOM-мутаций, до отрисовки браузером\n\n**Когда использовать `useLayoutEffect`:**\n- Когда нужно измерить DOM-элементы\n- Когда нужно предотвратить мигание (flash of content)\n\nВ большинстве случаев достаточно `useEffect`.',
    timestamp: '14:26',
  },
];

interface ChatWindowProps {
  chatTitle?: string;
  onOpenSettings: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle = 'Помощь с кодом на TypeScript',
  onOpenSettings,
}) => {
  const handleSend = (text: string) => {
    console.log('Send message:', text);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg-chat)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-primary)',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {chatTitle}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 500 }}>
              ● Онлайн
            </div>
          </div>
        </div>

        <Button
          variant="icon"
          title="Настройки"
          onClick={onOpenSettings}
          style={{
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '7px',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Button>
      </div>

      {/* Messages */}
      <MessageList messages={MOCK_MESSAGES} isTyping />

      {/* Input */}
      <InputArea onSend={handleSend} />
    </div>
  );
};
