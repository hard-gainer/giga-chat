import React from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { Button } from '../ui/Button';
import styles from './ChatWindow.module.css';
import { useChat } from '../../app/providers/ChatProvider';

interface ChatWindowProps {
  chatId?: string | null;
  chatTitle?: string;
  onOpenSettings?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  chatTitle = 'Помощь с кодом на TypeScript',
  onOpenSettings,
}) => {
  const { state, sendMessage, stopGenerating } = useChat();
  const activeId = chatId ?? state.activeChatId;
  const chat = state.chats.find((item) => item.id === activeId);
  const resolvedTitle = chat?.title ?? chatTitle;

  const handleSend = async (text: string) => {
    await sendMessage(activeId, text);
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerAvatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className={styles.titleWrap}>
            <div className={styles.title}>
              {resolvedTitle}
            </div>
            <div className={styles.status}>● Онлайн</div>
          </div>
        </div>

        <Button
          variant="icon"
          title="Настройки"
          onClick={onOpenSettings}
          className={styles.settingsBtn}
          disabled={!onOpenSettings}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Button>
      </div>

      {/* Messages */}
      <MessageList messages={chat?.messages ?? []} isTyping={state.isLoading} />

      {/* Input */}
      <InputArea onSend={handleSend} isLoading={state.isLoading} onStop={stopGenerating} />
    </div>
  );
};
