import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { ChatList } from './ChatList';
import type { Chat } from './ChatItem';
import { Button } from '../ui/Button';

const MOCK_CHATS: Chat[] = [
  { id: '1', title: 'Помощь с кодом на TypeScript', lastMessageDate: '12 мар, 14:32' },
  { id: '2', title: 'Анализ данных и визуализация', lastMessageDate: '12 мар, 11:05' },
  { id: '3', title: 'Перевод документации по React', lastMessageDate: '11 мар, 20:18' },
  { id: '4', title: 'Написание юнит-тестов Jest', lastMessageDate: '10 мар, 16:44' },
  { id: '5', title: 'Оптимизация SQL-запросов', lastMessageDate: '9 мар, 09:30' },
  { id: '6', title: 'Обзор кода pull request', lastMessageDate: '8 мар, 23:11' },
];

interface SidebarProps {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeChatId, onSelectChat, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = MOCK_CHATS.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log('Edit chat:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete chat:', id);
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--color-bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 12px',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 4px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            color: 'var(--color-text-sidebar)',
          }}
        >
          GigaChat
        </span>
      </div>

      {/* New Chat Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={onNewChat}
        style={{ width: '100%', gap: '6px', justifyContent: 'center' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Новый чат
      </Button>

      {/* Search */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Chat list label */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          color: 'var(--color-text-sidebar-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 4px',
        }}
      >
        Последние чаты
      </div>

      {/* Chat List */}
      <ChatList
        chats={filteredChats}
        activeChatId={activeChatId}
        onSelect={onSelectChat}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </aside>
  );
};
