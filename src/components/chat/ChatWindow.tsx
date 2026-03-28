import React, { useEffect, useRef, useState } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import type { Message as ChatMessage } from '../../types/message';
import { Button } from '../ui/Button';

const MOCK_ASSISTANT_RESPONSES = [
  'Хороший вопрос. Могу разобрать это по шагам и показать пример на TypeScript.',
  'Принял. Сейчас объясню кратко, а затем дам более детальный вариант.',
  'Давай сделаем так: сначала идея, потом практический пример и чек-лист.',
  'Понял задачу. Ниже привожу рабочий вариант и пояснения по ключевым моментам.',
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getCurrentTime = () =>
  new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

const getMockAssistantReply = (userText: string) => {
  const normalized = userText.toLowerCase();

  if (normalized.includes('useeffect')) {
    return 'useEffect запускается после рендера и подходит для побочных эффектов: запросов, подписок, таймеров. Если нужно, покажу шаблон с cleanup.';
  }

  if (normalized.includes('typescript') || normalized.includes('тип')) {
    return 'Для TypeScript лучше сразу описывать типы входных и выходных данных. Это снижает количество ошибок и упрощает рефакторинг.';
  }

  const randomIndex = Math.floor(Math.random() * MOCK_ASSISTANT_RESPONSES.length);
  return MOCK_ASSISTANT_RESPONSES[randomIndex];
};

interface ChatWindowProps {
  chatTitle?: string;
  onOpenSettings: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle = 'Помощь с кодом на TypeScript',
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = (text: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: text,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const delay = 1000 + Math.floor(Math.random() * 1001);
    pendingTimeoutRef.current = setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: getMockAssistantReply(text),
        timestamp: getCurrentTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      pendingTimeoutRef.current = null;
    }, delay);
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
      <MessageList messages={messages} isTyping={isLoading} />

      {/* Input */}
      <InputArea onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};
