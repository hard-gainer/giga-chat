import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import type { Message as ChatMessage } from '../../types/chat';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from '../ui/ErrorMessage';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isTyping) {
    return <EmptyState />;
  }

  return (
    <div className={styles.root}>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} variant={msg.role} />
      ))}
      <TypingIndicator isVisible={isTyping} />
      <div ref={bottomRef} />
    </div>
  );
};
