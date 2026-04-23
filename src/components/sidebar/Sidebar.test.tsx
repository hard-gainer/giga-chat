import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Sidebar } from './Sidebar';
import type { Chat } from '../../types/chat';

const chats: Chat[] = [
  {
    id: 'chat-1',
    title: 'React вопросы',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    messages: [{ id: 'm1', role: 'user', content: 'Про хуки', timestamp: '10:00' }],
  },
  {
    id: 'chat-2',
    title: 'TypeScript советы',
    createdAt: '2026-01-01T11:00:00.000Z',
    updatedAt: '2026-01-01T11:00:00.000Z',
    messages: [
      { id: 'm2', role: 'assistant', content: 'Старое важное сообщение', timestamp: '10:30' },
      { id: 'm3', role: 'assistant', content: 'Последний ответ без ключевого слова', timestamp: '11:00' },
    ],
  },
];

const renderSidebar = (overrides: Partial<ComponentProps<typeof Sidebar>> = {}) =>
  render(
    <Sidebar
      chats={chats}
      activeChatId={null}
      onSelectChat={vi.fn()}
      onNewChat={vi.fn()}
      onRenameChat={vi.fn()}
      onDeleteChat={vi.fn()}
      {...overrides}
    />
  );

describe('Sidebar', () => {
  it('filters chats by title while typing in search input', () => {
    renderSidebar();

    fireEvent.change(screen.getByPlaceholderText('Поиск чатов...'), {
      target: { value: 'React' },
    });

    expect(screen.getByText('React вопросы')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript советы')).not.toBeInTheDocument();
  });

  it('shows all chats when search query is empty', () => {
    renderSidebar();

    expect(screen.getByText('React вопросы')).toBeInTheDocument();
    expect(screen.getByText('TypeScript советы')).toBeInTheDocument();
  });

  it('filters chats by any message content, not only last message', () => {
    renderSidebar();

    fireEvent.change(screen.getByPlaceholderText('Поиск чатов...'), {
      target: { value: 'Старое важное' },
    });

    expect(screen.getByText('TypeScript советы')).toBeInTheDocument();
    expect(screen.queryByText('React вопросы')).not.toBeInTheDocument();
  });

  it('displays chat date metadata instead of last message preview text', () => {
    renderSidebar();

    expect(screen.queryByText('Про хуки')).not.toBeInTheDocument();
    expect(screen.queryByText('Последний ответ без ключевого слова')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Последнее сообщение:/i).length).toBeGreaterThan(0);
  });

  it('asks for confirmation when delete button is clicked', () => {
    const onDeleteChat = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderSidebar({ onDeleteChat });
    fireEvent.click(screen.getAllByTitle('Удалить')[0]);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(onDeleteChat).toHaveBeenCalledWith('chat-1');

    confirmSpy.mockRestore();
  });
});
