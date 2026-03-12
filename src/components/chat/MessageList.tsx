import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import type { MessageData } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from '../ui/ErrorMessage';

interface MessageListProps {
  messages: MessageData[];
  isTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return <EmptyState />;
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} variant={msg.role} />
      ))}
      {isTyping && <TypingIndicator isVisible />}
      <div ref={bottomRef} />
    </div>
  );
};
