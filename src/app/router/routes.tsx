import React, { useEffect, useState } from 'react';
import { createBrowserRouter, useNavigate, useParams } from 'react-router-dom';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Sidebar } from '../../components/sidebar/Sidebar';
import { Button } from '../../components/ui/Button';
import { useChat } from '../providers/ChatProvider';

const ChatLayout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, createChat, selectChat, renameChat, deleteChat } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const exists = state.chats.some((chat) => chat.id === id);
    if (!exists) {
      navigate('/', { replace: true });
      return;
    }

    selectChat(id);
  }, [id, state.chats, navigate, selectChat]);

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    navigate(`/chat/${chatId}`);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const chatId = createChat();
    navigate(`/chat/${chatId}`);
    setIsSidebarOpen(false);
  };

  const handleRenameChat = (chatId: string) => {
    const chat = state.chats.find((item) => item.id === chatId);
    const nextTitle = window.prompt('Введите новое название чата', chat?.title ?? '');
    if (nextTitle === null) return;
    renameChat(chatId, nextTitle);
  };

  const handleDeleteChat = (chatId: string) => {
    const ok = window.confirm('Удалить этот чат? История будет потеряна.');
    if (!ok) return;

    const isCurrent = (id ?? state.activeChatId) === chatId;
    deleteChat(chatId);
    if (isCurrent) {
      navigate('/');
    }
  };

  const chatId = id ?? state.activeChatId;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <div
        style={{
          display: 'flex',
          flexShrink: 0,
          zIndex: 50,
          height: '100%',
        }}
        className="sidebar-wrapper"
      >
        <Sidebar
          chats={state.chats}
          activeChatId={chatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          position: 'relative',
        }}
      >
        <Button
          variant="icon"
          onClick={() => setIsSidebarOpen((value) => !value)}
          title="Открыть меню"
          className="burger-btn"
          style={{
            position: 'absolute',
            top: '14px',
            left: '16px',
            zIndex: 10,
            display: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '6px',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Button>

        <ChatWindow chatId={chatId} />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper {
            position: fixed !important;
            top: 0;
            left: ${isSidebarOpen ? '0' : '-280px'} !important;
            bottom: 0;
            transition: left 0.25s ease;
          }
          .mobile-overlay {
            display: block !important;
          }
          .burger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <ChatLayout />,
  },
  {
    path: '/chat/:id',
    element: <ChatLayout />,
  },
]);
