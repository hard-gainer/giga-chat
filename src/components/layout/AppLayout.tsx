import React, { useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatWindow } from '../chat/ChatWindow';
import { SettingsPanel } from '../settings/SettingsPanel';
import { Button } from '../ui/Button';
import type { Chat } from '../../types/chat';
import type { ChatRequestSettings } from '../../api/gigachat';

interface AppLayoutProps {
  isDarkTheme: boolean;
  onThemeChange: (dark: boolean) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isDarkTheme, onThemeChange }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chats: Chat[] = [];
  const placeholderSettings: ChatRequestSettings & { systemPrompt: string } = {
    model: 'GigaChat',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024,
    repetitionPenalty: 1,
    systemPrompt: 'Ты полезный ИИ-ассистент.',
  };

  const handleNewChat = () => {
    console.log('New chat created');
    setActiveChatId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  const chatTitles: Record<string, string> = {
    '1': 'Помощь с кодом на TypeScript',
    '2': 'Анализ данных и визуализация',
    '3': 'Перевод документации по React',
    '4': 'Написание юнит-тестов Jest',
    '5': 'Оптимизация SQL-запросов',
    '6': 'Обзор кода pull request',
  };

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
      {/* Mobile overlay */}
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

      {/* Sidebar */}
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
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onRenameChat={() => undefined}
          onDeleteChat={() => undefined}
        />
      </div>

      {/* Main chat area */}
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
        {/* Mobile burger button */}
        <Button
          variant="icon"
          onClick={() => setIsSidebarOpen((v) => !v)}
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

        <ChatWindow
          chatTitle={activeChatId ? chatTitles[activeChatId] : undefined}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </main>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={onThemeChange}
        isDarkTheme={isDarkTheme}
        settings={placeholderSettings}
        availableModels={['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max']}
        onSaveSettings={() => undefined}
        onRefreshModels={async () => undefined}
      />

      {/* Responsive styles injected */}
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
