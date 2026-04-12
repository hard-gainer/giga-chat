import React, { Suspense, lazy, useState } from 'react';
import { Button } from '../ui/Button';
import { AssistantAvatar } from '../ui/AssistantAvatar';
import type { Message as ChatMessage, MessageRole } from '../../types/chat';
import styles from './Message.module.css';

const MarkdownRenderer = lazy(() =>
  import('./MarkdownRenderer').then((module) => ({ default: module.MarkdownRenderer }))
);

interface MessageProps {
  message: ChatMessage;
  variant: MessageRole;
}

export const Message: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);
  const isUser = variant === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${styles.root} ${isUser ? styles.user : styles.assistant}`}>
      {/* Avatar (only for assistant) */}
      {!isUser && <AssistantAvatar />}

      {/* Bubble */}
      <div className={styles.content}>
        {/* Sender label */}
        <div className={`${styles.sender} ${isUser ? styles.senderUser : styles.senderAssistant}`}>
          {isUser ? 'Вы' : 'GigaChat'}
        </div>

        <div className={styles.bubbleWrap}>
          <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
            <div className={`${styles.markdownBody} markdown-body`}>
              <Suspense fallback={<span>{message.content}</span>}>
                <MarkdownRenderer content={message.content} />
              </Suspense>
            </div>
          </div>

          {/* Copy button */}
          {!isUser && (
            <Button
              variant="icon"
              title={copied ? 'Скопировано!' : 'Копировать'}
              onClick={handleCopy}
              className={`${styles.copyBtn} ${styles.copyBtnAssistant} ${copied ? styles.copied : ''}`}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </Button>
          )}
        </div>

        {/* Timestamp */}
        <div className={`${styles.timestamp} ${isUser ? styles.timestampUser : styles.timestampAssistant}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
