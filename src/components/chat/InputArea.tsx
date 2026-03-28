import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading = false,
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_ROWS = 5;
  const LINE_HEIGHT = 22;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = MAX_ROWS * LINE_HEIGHT + 20;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div
      style={{
        padding: '12px 24px 20px',
        background: 'var(--color-bg-chat)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          background: 'var(--color-bg-input)',
          border: '1.5px solid var(--color-border-input)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '8px 8px 8px 14px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Attach image button */}
        <Button
          variant="icon"
          title="Прикрепить изображение"
          style={{ flexShrink: 0, color: 'var(--color-text-secondary)', marginBottom: '2px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? 'Ассистент печатает...'
              : 'Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)'
          }
          rows={1}
          disabled={isLoading}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family)',
            lineHeight: `${LINE_HEIGHT}px`,
            padding: '4px 0',
            overflowY: 'auto',
            maxHeight: `${MAX_ROWS * LINE_HEIGHT + 20}px`,
          }}
        />

        <Button
          variant={value.trim() && !isLoading ? 'primary' : 'ghost'}
          title="Отправить"
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          style={{
            flexShrink: 0,
            borderRadius: 'var(--border-radius-md)',
            padding: '7px',
            height: 'auto',
            opacity: value.trim() && !isLoading ? 1 : 0.4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Button>
      </div>

      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          marginTop: '8px',
          textAlign: 'center',
          opacity: 0.7,
        }}
      >
        GigaChat может совершать ошибки. Проверяйте важную информацию.
      </p>
    </div>
  );
};
