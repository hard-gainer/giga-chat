import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading = false,
  onStop,
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
    <div className={styles.container}>
      <div className={styles.box}>
        {/* Attach image button */}
        <Button
          variant="icon"
          title="Прикрепить изображение"
          className={styles.attachBtn}
          disabled={isLoading}
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
          className={styles.textarea}
        />

        {isLoading ? (
          <Button
            variant="icon"
            title="Остановить генерацию"
            onClick={onStop}
            className={`${styles.stopBtn} ${styles.sendBtn}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </Button>
        ) : (
          <Button
            variant={value.trim() ? 'primary' : 'ghost'}
            title="Отправить"
            onClick={handleSend}
            disabled={!value.trim()}
            className={`${styles.sendBtn} ${!value.trim() ? styles.sendBtnDisabled : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        )}
      </div>

      <p className={styles.hint}>
        GigaChat может совершать ошибки. Проверяйте важную информацию.
      </p>
    </div>
  );
};
