import React from 'react';
import { AssistantAvatar } from '../ui/AssistantAvatar';

interface TypingIndicatorProps {
  isVisible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;

  const dotStyle = (delay: string): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--color-accent)',
    animation: 'bounce 1.4s infinite ease-in-out',
    animationDelay: delay,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '4px 0',
      }}
    >
      <AssistantAvatar />

      {/* Bubble */}
      <div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginBottom: '4px',
            fontWeight: 500,
          }}
        >
          GigaChat
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '12px 18px',
            background: 'var(--color-bg-assist-msg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-sm)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={dotStyle('0s')} />
          <span style={dotStyle('0.2s')} />
          <span style={dotStyle('0.4s')} />
        </div>
      </div>
    </div>
  );
};
