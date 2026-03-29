import React, { useState } from 'react';
import { Button } from '../ui/Button';
import type { Chat } from '../../types/chat';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onSelect, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const lastMessage = chat.messages[chat.messages.length - 1];
  const lastMessageDate = new Date(chat.updatedAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(chat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 'var(--border-radius-sm)',
        background: isActive
          ? 'var(--color-bg-sidebar-active)'
          : hovered
          ? 'var(--color-bg-sidebar-hover)'
          : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--transition-fast)',
        borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
        gap: '8px',
      }}
    >
      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: isActive ? 600 : 400,
            color: 'var(--color-text-sidebar)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {chat.title}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-sidebar-secondary)',
            marginTop: '2px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {lastMessage?.content || lastMessageDate}
        </div>
      </div>

      {/* Action buttons (visible on hover) */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <Button
          variant="icon"
          title="Переименовать"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(chat.id);
          }}
          style={{ color: 'var(--color-text-sidebar-secondary)', padding: '4px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Button>
        <Button
          variant="icon"
          title="Удалить"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          style={{ color: '#f87171', padding: '4px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
