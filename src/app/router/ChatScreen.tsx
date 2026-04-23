import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Button } from '../../components/ui/Button';
import { useChat } from '../providers/ChatProvider';

const Sidebar = lazy(() =>
  import('../../components/sidebar/Sidebar').then((module) => ({ default: module.Sidebar }))
);

const SettingsPanel = lazy(() =>
  import('../../components/settings/SettingsPanel').then((module) => ({ default: module.SettingsPanel }))
);

export const ChatScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state,
    settings,
    availableModels,
    createChat,
    selectChat,
    renameChat,
    deleteChat,
    updateSettings,
    refreshModels,
  } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const handleThemeChange = useCallback((dark: boolean) => {
    setIsDarkTheme(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

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

  const handleSelectChat = useCallback(
    (chatId: string) => {
      selectChat(chatId);
      navigate(`/chat/${chatId}`);
      setIsSidebarOpen(false);
    },
    [navigate, selectChat]
  );

  const handleNewChat = useCallback(() => {
    const chatId = createChat();
    navigate(`/chat/${chatId}`);
    setIsSidebarOpen(false);
  }, [createChat, navigate]);

  const handleRenameChat = useCallback(
    (chatId: string) => {
      const chat = state.chats.find((item) => item.id === chatId);
      const nextTitle = window.prompt('Введите новое название чата', chat?.title ?? '');
      if (nextTitle === null) return;
      renameChat(chatId, nextTitle);
    },
    [renameChat, state.chats]
  );

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      const isCurrent = (id ?? state.activeChatId) === chatId;
      deleteChat(chatId);
      if (isCurrent) {
        navigate('/');
      }
    },
    [deleteChat, id, navigate, state.activeChatId]
  );

  const chatId = useMemo(() => id ?? state.activeChatId, [id, state.activeChatId]);

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
        <Suspense fallback={<div style={{ width: 'var(--sidebar-width)', background: 'var(--color-bg-sidebar)' }} />}>
          <Sidebar
            chats={state.chats}
            activeChatId={chatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
          />
        </Suspense>
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

        <ChatWindow chatId={chatId} onOpenSettings={() => setIsSettingsOpen(true)} />
      </main>

      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onThemeChange={handleThemeChange}
          isDarkTheme={isDarkTheme}
          settings={settings}
          availableModels={availableModels}
          onSaveSettings={updateSettings}
          onRefreshModels={refreshModels}
        />
      </Suspense>

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
