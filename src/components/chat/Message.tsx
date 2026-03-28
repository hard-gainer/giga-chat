import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui/Button';
import { AssistantAvatar } from '../ui/AssistantAvatar';
import type { Message as ChatMessage, MessageRole } from '../../types/message';

interface MessageProps {
  message: ChatMessage;
  variant: MessageRole;
}

export const Message: React.FC<MessageProps> = ({ message, variant }) => {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = variant === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '4px 0',
      }}
    >
      {/* Avatar (only for assistant) */}
      {!isUser && <AssistantAvatar />}

      {/* Bubble */}
      <div style={{ maxWidth: '72%', minWidth: '80px' }}>
        {/* Sender label */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginBottom: '4px',
            textAlign: isUser ? 'right' : 'left',
            fontWeight: 500,
          }}
        >
          {isUser ? 'Вы' : 'GigaChat'}
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: isUser
                ? 'var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-sm) var(--border-radius-lg)'
                : 'var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-sm)',
              background: isUser ? 'var(--color-bg-user-msg)' : 'var(--color-bg-assist-msg)',
              color: isUser ? 'var(--color-text-user-msg)' : 'var(--color-text-assist-msg)',
              boxShadow: 'var(--shadow-sm)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.65,
              border: isUser ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <div className="markdown-body">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>

          {/* Copy button */}
          <Button
            variant="icon"
            title={copied ? 'Скопировано!' : 'Копировать'}
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '-8px',
              right: isUser ? 'auto' : '-8px',
              left: isUser ? '-8px' : 'auto',
              opacity: hovered ? 1 : 0,
              transition: 'opacity var(--transition-fast)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              padding: '4px',
              color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
            }}
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
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left',
            opacity: 0.7,
          }}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
