import React from 'react';
import { ChatItem } from './ChatItem';
import type { Chat } from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  if (chats.length === 0) {
    return (
      <div
        style={{
          padding: '24px 12px',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-sidebar-secondary)',
        }}
      >
        Чатов не найдено
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
        flex: 1,
      }}
    >
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
